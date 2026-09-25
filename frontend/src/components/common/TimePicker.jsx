import React, { useState, useEffect } from "react";

const TimePicker = ({ value, onChange }) => {
  // value is expected to be in "HH:MM" 24-hour format
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("PM");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      let hourNum = parseInt(h, 10);
      const isPm = hourNum >= 12;
      
      if (hourNum === 0) hourNum = 12;
      else if (hourNum > 12) hourNum -= 12;

      setHour(hourNum.toString().padStart(2, "0"));
      setMinute(m);
      setAmpm(isPm ? "PM" : "AM");
    }
  }, [value]);

  const updateTime = (h, m, ap) => {
    let hr24 = parseInt(h || "0", 10);
    const minNum = parseInt(m || "0", 10);
    
    if (ap === "PM" && hr24 < 12) hr24 += 12;
    if (ap === "AM" && hr24 === 12) hr24 = 0;
    
    const formatted24Hour = hr24.toString().padStart(2, "0");
    const formattedMinute = minNum.toString().padStart(2, "0");
    onChange(`${formatted24Hour}:${formattedMinute}`);
  };

  const handleHourChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2);
    if (parseInt(val, 10) > 12) val = "12";
    setHour(val);
  };

  const handleHourBlur = () => {
    let val = hour;
    if (!val || parseInt(val, 10) === 0) val = "12";
    else if (val.length === 1) val = `0${val}`;
    setHour(val);
    updateTime(val, minute, ampm);
  };

  const handleMinuteChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2);
    if (parseInt(val, 10) > 59) val = "59";
    setMinute(val);
  };

  const handleMinuteBlur = () => {
    let val = minute;
    if (!val) val = "00";
    else if (val.length === 1) val = `0${val}`;
    setMinute(val);
    updateTime(hour, val, ampm);
  };

  const toggleAmpm = () => {
    const newAmpm = ampm === "AM" ? "PM" : "AM";
    setAmpm(newAmpm);
    updateTime(hour, minute, newAmpm);
  };

  return (
    <div className="flex items-center gap-1.5 h-9 bg-white border border-slate-300 rounded-lg px-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
      <input
        type="text"
        value={hour}
        onChange={handleHourChange}
        onBlur={handleHourBlur}
        className="w-7 text-center bg-transparent border-none p-0 text-sm font-medium focus:ring-0 focus:outline-none text-slate-800"
        placeholder="12"
      />
      <span className="text-slate-400 font-bold -mt-0.5">:</span>
      <input
        type="text"
        value={minute}
        onChange={handleMinuteChange}
        onBlur={handleMinuteBlur}
        className="w-7 text-center bg-transparent border-none p-0 text-sm font-medium focus:ring-0 focus:outline-none text-slate-800"
        placeholder="00"
      />
      <button
        type="button"
        onClick={toggleAmpm}
        className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none"
      >
        {ampm}
      </button>
    </div>
  );
};

export default TimePicker;
