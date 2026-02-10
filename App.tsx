
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

  // 计算结算逻辑
  const summary = useMemo(() => calculateSummary(participants), [participants]);

  const handleAddParticipant = () => {
    const nextId = (Math.max(0, ...participants.map(p => parseInt(p.id) || 0)) + 1).toString();
    setParticipants([...participants, { id: nextId, name: '', spent: 0 }]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleUpdateParticipant = (id: string, field: keyof Participant, value: string | number) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(reportRef.current, { 
        backgroundColor: '#f8fafc',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `分账大师_结算报告_${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出图片失败', err);
      alert('保存图片失败，请稍后重试');
    }
  };

  const chartData = useMemo(() => {
    return participants.map(p => ({
      name: p.name || '匿名',
      spent: p.spent || 0,
      diff: (p.spent || 0) - summary.average
    }));
  }, [participants, summary.average]);

  return (
    <div className="min-h-screen pb-12">
      {/* 导航栏 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">分账大师</h1>
          </div>
          <button 
            onClick={handleExportImage}
            disabled={participants.length === 0}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            保存结算图片
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 输入面板 */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-500" />
                支出录入
              </h2>
              <button 
                onClick={handleAddParticipant}
                className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                添加成员
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {participants.map((p) => (
                <div key={p.id} className="flex gap-3 items-end group animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">姓名</label>
                    <input 
                      type="text"
                      value={p.name}
                      onChange={(e) => handleUpdateParticipant(p.id, 'name', e.target.value)}
                      placeholder="例如：小王"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">花费</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">¥</span>
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
                    title="删除此项"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-sm mb-4">当前没有记录任何支出</p>
                  <button 
                    onClick={handleAddParticipant} 
                    className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" /> 立即添加第一位成员
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest">统计概览</span>
                <RefreshCw className="w-4 h-4 text-indigo-300 opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-black">¥{summary.total.toFixed(2)}</div>
                  <div className="text-indigo-200 text-[10px] font-bold uppercase mt-1">总花费</div>
                </div>
                <div>
                  <div className="text-3xl font-black">¥{summary.average.toFixed(2)}</div>
                  <div className="text-indigo-200 text-[10px] font-bold uppercase mt-1">人均消费</div>
                </div>
              </div>
            </div>
            {/* 背景装饰 */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          </div>
        </section>

        {/* 报表面板 */}
        <section className="lg:col-span-7" ref={reportRef}>
          <div className="space-y-8 bg-slate-50 p-2 md:p-4 rounded-3xl border border-transparent"> 
            
            {/* 结算结果 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  最优结算路径
                </h2>
              </div>
              <div className="p-6">
                {summary.settlements.length > 0 ? (
                  <div className="space-y-3">
                    {summary.settlements.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">付款人</span>
                            <span className="font-bold text-slate-800">{s.from || '匿名'}</span>
                          </div>
                          <div className="flex flex-col items-center px-2">
                            <div className="h-px w-10 bg-slate-200 relative">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[4px] border-y-transparent border-l-[6px] border-l-slate-300"></div>
                            </div>
                            <span className="text-[8px] font-black text-indigo-400 mt-1 uppercase">支付给</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">收款人</span>
                            <span className="font-bold text-slate-800">{s.to || '匿名'}</span>
                          </div>
                        </div>
                        <div className="text-xl font-black text-indigo-600">
                          ¥{s.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 font-medium">无需结算，大家的花费已经均衡了！</p>
                  </div>
                )}
              </div>
            </div>

            {/* 消费图表分析 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-500" />
                  个人消费分布
                </h2>
              </div>
              <div className="p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white shadow-2xl border border-slate-100 p-3 rounded-xl text-sm min-w-32">
                                <p className="font-bold text-slate-800 mb-1">{data.name}</p>
                                <p className="text-slate-500 text-xs">实付: <span className="text-slate-900 font-bold">¥{payload[0].value}</span></p>
                                <div className={`mt-2 py-1 px-2 rounded text-[10px] font-bold uppercase text-center ${data.diff >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}>
                                  {data.diff >= 0 ? '需退回' : '需补交'} ¥{Math.abs(data.diff).toFixed(2)}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine 
                        y={summary.average} 
                        stroke="#6366f1" 
                        strokeDasharray="5 5" 
                        label={{ value: '平均值', position: 'top', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <Bar dataKey="spent" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.spent >= summary.average ? '#6366f1' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.diff >= 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                        <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.diff >= 0 ? '多于' : '少于'}平均线</span>
                        <span className={`text-sm font-black ${item.diff >= 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          ¥{Math.abs(item.diff).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 底部品牌水印 (仅在生成的图中可见) */}
            <div className="text-center pt-4 opacity-30">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calculator className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">分账大师</span>
              </div>
              <p className="text-[8px] text-slate-400 italic">FairShare Master - 让朋友间的账单更简单</p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
