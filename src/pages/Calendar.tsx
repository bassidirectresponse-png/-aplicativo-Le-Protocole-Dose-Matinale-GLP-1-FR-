import React, { useCallback, useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { TrendingDown, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-pink-100 px-4 py-3">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-black text-pink-500">{payload[0].value} <span className="text-sm font-bold text-gray-400">kg</span></p>
      </div>
    );
  }
  return null;
};

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('weight_entries').select('*').eq('user_id', user.id)
        .order('date', { ascending: true });
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchEntries();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchEntries]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const existing = entries.find(e => isSameDay(parseISO(e.date), day));
    setNewWeight(existing ? existing.weight.toString() : '');
    setModalOpen(true);
  };

  const saveWeight = async () => {
    if (!user || !selectedDate || !newWeight) return;
    setSaving(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const weightValue = parseFloat(newWeight);
      const existing = entries.find(e => e.date === dateStr);

      if (existing) {
        const { error } = await supabase.from('weight_entries')
          .update({ weight: weightValue }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('weight_entries')
          .insert({ user_id: user.id, date: dateStr, weight: weightValue });
        if (error) throw error;
      }

      const { data: latestWeight, error: latestError } = await supabase
        .from('weight_entries')
        .select('weight')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1);

      if (latestError) throw latestError;
      const currentWeight = latestWeight?.length ? Number(latestWeight[0].weight) : weightValue;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ current_weight: currentWeight })
        .eq('id', user.id);
      if (profileError) throw profileError;

      await fetchEntries();
      setModalOpen(false);
      setNewWeight('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const chartData = entries.map(e => ({
    date: format(parseISO(e.date), 'd MMM', { locale: fr }),
    weight: e.weight,
  }));

  const firstWeight = entries[0]?.weight;
  const lastWeight = entries[entries.length - 1]?.weight;
  const totalLost = firstWeight && lastWeight ? (firstWeight - lastWeight) : 0;
  const minWeight = chartData.length ? Math.min(...chartData.map(d => d.weight)) - 2 : 50;
  const maxWeight = chartData.length ? Math.max(...chartData.map(d => d.weight)) + 2 : 120;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7fb] pb-28">
      <div className="px-5 pt-8 pb-5">
        <h1 className="text-2xl font-black text-gray-800">Suivi du poids</h1>
        <p className="text-gray-400 text-sm mt-0.5">Touchez un jour pour enregistrer votre poids</p>
      </div>

      <div className="px-5 mb-5">
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-5 text-white shadow-lg shadow-pink-200/50">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <TrendingDown size={23} />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight mb-1">Gardez votre protocole calibre</p>
              <p className="text-pink-100 text-sm leading-relaxed">
                Chaque poids enregistre met a jour vos parametres, vos doses de recettes et vos calories. Entrez votre poids du matin des que possible.
              </p>
            </div>
          </div>
          {entries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-pink-200" />
              <p className="text-sm text-pink-100 font-medium">
                {entries.length} {entries.length === 1 ? 'entree' : 'entrees'} enregistrees
                {totalLost > 0 && ` · ${totalLost.toFixed(1)} kg perdus`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-pink-50 text-pink-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-black text-gray-800 text-lg capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-pink-50 text-pink-500 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-300 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {daysInMonth.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const entry = entries.find(e => e.date === dateStr);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  className={`relative flex flex-col items-center justify-center h-11 rounded-2xl transition-all active:scale-95 ${
                    entry
                      ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md shadow-pink-200'
                      : isToday
                        ? 'bg-pink-50 border-2 border-pink-300 text-pink-700'
                        : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className={`text-sm leading-none ${entry ? 'font-bold' : 'font-semibold'}`}>
                    {format(day, 'd')}
                  </span>
                  {entry && (
                    <span className="text-[9px] font-bold leading-none mt-0.5 opacity-90">
                      {entry.weight}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingDown size={18} className="text-pink-400" />
                <h2 className="font-extrabold text-gray-800">Evolution du poids</h2>
              </div>
              {totalLost > 0 && (
                <p className="text-sm font-semibold text-green-500 ml-6">
                  {totalLost.toFixed(1)} kg perdus au total
                </p>
              )}
            </div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">kg</span>
          </div>

          {chartData.length >= 1 ? (
            <div className="h-52 w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[minWeight, maxWeight]}
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fce7f3', strokeWidth: 2 }} />
                  {firstWeight && (
                    <ReferenceLine y={firstWeight} stroke="#fce7f3" strokeDasharray="4 4" strokeWidth={2} />
                  )}
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fill="url(#weightGradient)"
                    dot={{ fill: '#ec4899', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, fill: '#db2777', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-dashed border-pink-200">
              <p className="text-sm font-bold text-gray-500">Enregistrez votre premier poids</p>
              <p className="text-xs text-gray-400 mt-1">Votre graphique apparaitra ici</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && selectedDate && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center p-4 animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl mb-2">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-1 capitalize">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </p>
              <h2 className="text-xl font-extrabold text-gray-800">Entrez votre poids</h2>
            </div>

            <div className="flex items-end justify-center gap-3 mb-8">
              <input
                type="number"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                autoFocus
                step="0.1"
                placeholder="0.0"
                className="text-center text-5xl font-black text-pink-500 bg-transparent border-none outline-none w-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-pink-200"
              />
              <span className="text-2xl font-bold text-gray-300 mb-2">kg</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveWeight}
                disabled={saving || !newWeight}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
