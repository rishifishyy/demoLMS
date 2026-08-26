'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (isoString: string) => void;
  label?: string;
}

export function CustomDateTimePicker({ value, onChange, label = 'Schedule Follow-up' }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parsed state
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState<Date>(initialDate);
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());
  
  let initialHours = initialDate.getHours();
  const isPM = initialHours >= 12;
  const initialHour12 = initialHours % 12 || 12;
  const [selectedHour, setSelectedHour] = useState<number>(initialHour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(Math.round(initialDate.getMinutes() / 15) * 15 % 60);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(isPM ? 'PM' : 'AM');

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Quick Preset Helper
  const applyPreset = (daysOffset: number, hour: number, ampm: 'AM' | 'PM') => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setSelectedDay(d.getDate());
    setSelectedMonth(d.getMonth());
    setSelectedYear(d.getFullYear());
    setViewDate(d);
    setSelectedHour(hour);
    setSelectedMinute(0);
    setSelectedAmPm(ampm);
    
    let h24 = hour;
    if (ampm === 'PM' && hour < 12) h24 += 12;
    if (ampm === 'AM' && hour === 12) h24 = 0;
    d.setHours(h24, 0, 0, 0);

    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    onChange(iso);
    setIsOpen(false);
  };

  const handleDone = () => {
    let h24 = selectedHour;
    if (selectedAmPm === 'PM' && selectedHour < 12) h24 += 12;
    if (selectedAmPm === 'AM' && selectedHour === 12) h24 = 0;

    const d = new Date(selectedYear, selectedMonth, selectedDay, h24, selectedMinute, 0, 0);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    onChange(iso);
    setIsOpen(false);
  };

  const formatDisplay = (isoStr: string) => {
    if (!isoStr) return 'Click to schedule follow-up date & time';
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{label}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] font-bold text-rose-500 hover:underline"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
          value
            ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs font-bold'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'
        }`}
      >
        <span className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${value ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>{formatDisplay(value)}</span>
        </span>
        <span className="text-[11px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-100 shadow-2xs">
          {value ? 'Change' : 'Pick Date'}
        </span>
      </button>

      {/* 1-Tap Quick Presets */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => applyPreset(0, 5, 'PM')}
          className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
        >
          ⚡ Today 5:00 PM
        </button>
        <button
          type="button"
          onClick={() => applyPreset(1, 11, 'AM')}
          className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
        >
          ☀️ Tomorrow 11:00 AM
        </button>
        <button
          type="button"
          onClick={() => applyPreset(2, 11, 'AM')}
          className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
        >
          🗓️ In 2 Days
        </button>
      </div>

      {/* CUSTOM IN-APP MODAL WITH EXPLICIT DONE BUTTON */}
      {isOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">Select Date & Time</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between px-1">
              <span className="font-extrabold text-xs text-slate-900">
                {monthNames[selectedMonth]} {selectedYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <span key={'empty-' + i} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected = selectedDay === dayNum;
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      className={`h-8 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time</span>
              <div className="flex items-center justify-between gap-2">
                {/* Hour */}
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                    <option key={h} value={h}>{h < 10 ? '0' + h : h}</option>
                  ))}
                </select>

                <span className="font-bold text-slate-400">:</span>

                {/* Minute */}
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>{m < 10 ? '0' + m : m}</option>
                  ))}
                </select>

                {/* AM / PM Toggle */}
                <div className="flex bg-slate-200/80 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedAmPm('AM')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedAmPm === 'AM' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAmPm('PM')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedAmPm === 'PM' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* THE PROMINENT DONE BUTTON */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Done / Confirm Date</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
