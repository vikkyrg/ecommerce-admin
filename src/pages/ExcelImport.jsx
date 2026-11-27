import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, CheckCircle2, FileSpreadsheet, ShieldCheck, Upload } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { previewCatalogImportApi, confirmCatalogImportApi } from '../services/adminApi';

export default function ExcelImport() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [workbookPayload, setWorkbookPayload] = useState({});
  const [reviewedCells, setReviewedCells] = useState([]);
  const [mappingDecisions, setMappingDecisions] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const reviewItems = useMemo(() => {
    if (!preview) return [];
    return [
      ...(preview.ambiguousMappings || []).map(item => ({ ...item, kind: 'Ambiguous mapping' })),
      ...(preview.invalidEntries || []).map(item => ({
        ...item,
        issue: item.reason,
        kind: 'Incomplete entry'
      }))
    ];
  }, [preview]);

  const runPreview = async payload => {
    setLoading(true);
    setError('');
    setResult(null);
    setReviewedCells([]);
    setMappingDecisions({});
    setConfirmed(false);
    setWorkbookPayload(payload);
    try {
      setPreview(await previewCatalogImportApi(payload));
    } catch (previewError) {
      setPreview(null);
      setError(previewError.message || 'Unable to inspect workbook');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError('Choose an Excel workbook (.xlsx or .xls).');
      event.target.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Workbook must be 20 MB or smaller.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => runPreview({ base64Data: reader.result });
    reader.onerror = () => setError('Unable to read the selected workbook.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const toggleReviewedCell = cell => {
    setReviewedCells(current =>
      current.includes(cell) ? current.filter(value => value !== cell) : [...current, cell]
    );
  };

  const handleReplace = async () => {
    if (!preview || !confirmed || !allReviewed || !allMappingsChosen) return;
    setImporting(true);
    setError('');
    try {
      const response = await confirmCatalogImportApi({
        ...workbookPayload,
        workbookHash: preview.workbookHash,
        replaceExisting: true,
        reviewedCells,
        mappingDecisions
      });
      setResult(response);
    } catch (importError) {
      setError(importError.message || 'Catalog replacement failed');
    } finally {
      setImporting(false);
    }
  };

  const allReviewed = reviewItems.every(item => reviewedCells.includes(item.sourceCell));
  const allMappingsChosen = (preview?.ambiguousMappings || [])
    .filter(item => item.options?.length)
    .every(item => item.options.includes(mappingDecisions[item.sourceCell]));

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Catalog Workbook Review"
        subtitle="Inspect and safely replace catalog records"
        onMenuClick={toggleMobileMenu}
      />

      <main className="min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        <section className="space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1E293B]">Workbook Ingestion</h2>
              <p className="text-[13px] text-[#64748B] mt-0.5">
                Upload the Excel catalog workbook to inspect sheets, validate mappings, and review conflicts.
              </p>
            </div>
            <label className="h-[40px] px-4 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13px] font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer flex-shrink-0">
              <Upload className="w-4 h-4 text-white" />
              <span>Select Workbook</span>
              <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          {loading && <p className="text-[13px] text-[#64748B]">Inspecting workbook structure and records...</p>}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {result && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Catalog replaced: {result.totalProducts} records now published.</span>
            </div>
          )}
        </section>

        {preview && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <span className="text-[11px] font-semibold uppercase text-[#64748B]">Total Entries</span>
                <p className="text-[24px] font-[650] text-[#1E293B] mt-1">{preview.summary.totalEntries}</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <span className="text-[11px] font-semibold uppercase text-[#64748B]">Valid Records</span>
                <p className="text-[24px] font-[650] text-emerald-700 mt-1">{preview.summary.validEntries}</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <span className="text-[11px] font-semibold uppercase text-[#64748B]">Ambiguous</span>
                <p className="text-[24px] font-[650] text-amber-700 mt-1">{preview.summary.ambiguousMappings}</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <span className="text-[11px] font-semibold uppercase text-[#64748B]">Incomplete</span>
                <p className="text-[24px] font-[650] text-red-700 mt-1">{preview.summary.invalidEntries}</p>
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1E293B]">Required Review Items</h3>
                  <p className="text-[12px] text-[#64748B] mt-0.5">
                    Resolve all ambiguous category mappings and review flagged entries before catalog replacement.
                  </p>
                </div>
                <span className="text-[12px] font-medium text-[#64748B]">
                  {reviewedCells.length} of {reviewItems.length} acknowledged
                </span>
              </div>

              {reviewItems.length === 0 ? (
                <p className="text-[13px] text-emerald-700">Workbook passed inspection with zero blocking conflicts.</p>
              ) : (
                <div className="space-y-3">
                  {reviewItems.map(item => {
                    const isReviewed = reviewedCells.includes(item.sourceCell);
                    return (
                      <div
                        key={`${item.sourceCell}-${item.kind}`}
                        className={`p-3.5 border rounded-md transition-colors ${
                          isReviewed ? 'border-emerald-200 bg-emerald-50/40' : 'border-[#E2E8F0] bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                              Cell {item.sourceCell} · {item.kind}
                            </span>
                            <p className="text-[13px] font-medium text-[#1E293B] mt-0.5">
                              {item.title || item.rawCategory || 'Catalog row item'}
                            </p>
                            <p className="text-[12px] text-[#64748B] mt-0.5">{item.issue}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleReviewedCell(item.sourceCell)}
                            className={`h-[34px] px-3 rounded-md text-[12px] font-medium border transition-colors ${
                              isReviewed
                                ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] hover:bg-slate-200/60'
                            }`}
                          >
                            {isReviewed ? 'Acknowledged' : 'Acknowledge'}
                          </button>
                        </div>

                        {item.options?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2">
                            <span className="text-[12px] text-[#64748B]">Select target category:</span>
                            {item.options.map(option => (
                              <button
                                key={option}
                                type="button"
                                onClick={() =>
                                  setMappingDecisions(current => ({
                                    ...current,
                                    [item.sourceCell]: option
                                  }))
                                }
                                className={`h-[30px] px-2.5 rounded text-[12px] font-medium border transition-colors ${
                                  mappingDecisions[item.sourceCell] === option
                                    ? 'bg-[#F8F3E9] text-[#B8862D] border-[#B8862D]'
                                    : 'bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={event => setConfirmed(event.target.checked)}
                    className="rounded text-[#B8862D] focus:ring-0 w-4 h-4"
                  />
                  <span>I understand this operation replaces the active catalog database.</span>
                </label>

                <button
                  type="button"
                  onClick={handleReplace}
                  disabled={!confirmed || !allReviewed || !allMappingsChosen || importing}
                  className="h-[40px] px-4 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13px] font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {importing ? 'Replacing Catalog...' : 'Confirm Catalog Replacement'}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
