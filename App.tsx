
import React, { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, Download, RefreshCw, Calculator, Receipt, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import * as htmlToImage from 'html-to-image';
import { Participant } from './types';
import { calculateSummary } from './utils/settlement';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '小明', spent: 120 },
    { id: '2', name: '小红', spent: 70 },
    { id: '3', name: '小强', spent: 0 },
  ]);

  const reportRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => calculateSummary(participants), [participants]);

  const handleAddParticipant = () => {
    const nextId = (Math.max(0, ...participants.map(p => parseInt(p.id))) + 1).toString();
    setParticipants([...participants, { id: nextId, name: '', spent: 0 }]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleUpdateParticipant = (id: string, field: keyof Participant, value: string | number) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleExportImage = async () => {
    if (reportRef.current === null) return;
    try {
      const dataUrl = await htmlToImage.toPng(reportRef.current, { backgroundColor: '#f8fafc' });
      const link = document.createElement('a');
      link.download = '结算方案报告.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出图片失败', err);
    }
  };

  const chartData = useMemo(() => {
    return participants.map(p => ({
      name: p.name || '匿名',
      spent: p.spent,
      diff: p.spent - summary.average
    }));
  }, [participants, summary.average]);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">分账大师</h1>
          </div>
          <button 
            onClick={handleExportImage}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            保存为图片
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-500" />
                账单支出明细
              </h2>
              <button 
                onClick={handleAddParticipant}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                添加成员
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {participants.map((p) => (
                <div key={p.id} className="flex gap-3 items-end group">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">姓名</label>
                    <input 
                      type="text"
                      value={p.name}
                      onChange={(e) => handleUpdateParticipant(p.id, 'name', e.target.value)}
                      placeholder="例如：张三"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">花费</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                      <input 
                        type="number"
                        value={p.spent || ''}
                        onChange={(e) => handleUpdateParticipant(p.id, 'spent', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <p className="text-sm">暂无成员。</p>
                  <button onClick={handleAddParticipant} className="text-indigo-600 text-sm font-medium hover:underline">点击添加新成员</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-indigo-100 text-sm font-medium">全局概览</span>
              <RefreshCw className="w-4 h-4 text-indigo-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">¥{summary.total.toFixed(2)}</div>
                <div className="text-indigo-200 text-xs uppercase tracking-wide mt-1">总支出</div>
              </div>
              <div>
                <div className="text-2xl font-bold">¥{summary.average.toFixed(2)}</div>
                <div className="text-indigo-200 text-xs uppercase tracking-wide mt-1">人均消费</div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-7" ref={reportRef}>
          <div className="space-y-8 p-1"> 
            
            {/* Settlement Instructions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  结算方案
                </h2>
              </div>
              <div className="p-6">
                {summary.settlements.length > 0 ? (
                  <div className="space-y-3">
                    {summary.settlements.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700">{s.from || '某人'}</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase">支付给</span>
                            <div className="h-px w-12 bg-slate-300 relative my-1">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-300"></div>
                            </div>
                          </div>
                          <span className="font-semibold text-slate-700">{s.to || '某人'}</span>
                        </div>
                        <div className="text-lg font-bold text-indigo-600">
                          ¥{s.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 italic text-sm">
                    账目已平，无需结算！
                  </div>
                )}
              </div>
            </div>

            {/* Visualizations */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-500" />
                  消费分析图表
                </h2>
              </div>
              <div className="p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white shadow-xl border border-slate-100 p-3 rounded-lg text-sm">
                                <p className="font-bold text-slate-700">{payload[0].payload.name}</p>
                                <p className="text-slate-500">已付: ¥{payload[0].value}</p>
                                <p className={payload[0].payload.diff >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>
                                  {payload[0].payload.diff >= 0 ? '高于' : '低于'}平均值 ¥{Math.abs(payload[0].payload.diff).toFixed(2)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={summary.average} stroke="#6366f1" strokeDasharray="5 5" label={{ value: '平均线', position: 'right', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
                      <Bar dataKey="spent" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.spent >= summary.average ? '#6366f1' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.diff >= 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                        <span className="text-sm font-medium text-slate-600">{item.name}</span>
                      </div>
                      <span className={`text-xs font-bold ${item.diff >= 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {item.diff >= 0 ? '多付' : '少付'} ¥{Math.abs(item.diff).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Branding for Image */}
            <div className="text-center text-slate-400 text-[10px] py-4 uppercase tracking-[0.2em]">
              由 分账大师 生成 &bull; 轻松结算每一分
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
