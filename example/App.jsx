import { useState } from 'react';
import ClockTimePicker from '../ClockTimePicker.jsx';
import '../ClockTimePicker.css';

export default function App() {
  const [time1, setTime1] = useState('09:00');
  const [time2, setTime2] = useState('17:30');
  const [timeDisabled, setTimeDisabled] = useState('12:00');
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`demo-container ${theme === 'light' ? 'ctp-light light-theme' : ''}`}>
      <style>{`
        .demo-container {
          min-height: 100vh;
          width: 100%;
          background: #0b0f19;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          box-sizing: border-box;
          transition: background 0.3s, color 0.3s;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .demo-container.light-theme {
          background: #f8fafc;
          color: #0f172a;
        }
        .demo-wrapper {
          max-width: 600px;
          width: 100%;
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          box-sizing: border-box;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .light-theme .demo-wrapper {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
        }
        .light-theme .demo-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .demo-title {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #38bdf8, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .theme-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .theme-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .light-theme .theme-btn {
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .light-theme .theme-btn:hover {
          background: rgba(0, 0, 0, 0.08);
        }
        .demo-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media(min-width: 600px) {
          .demo-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .picker-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 20px;
          box-sizing: border-box;
          transition: background 0.3s, border-color 0.3s;
        }
        .light-theme .picker-card {
          background: rgba(241, 245, 249, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .picker-label {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 12px;
          display: block;
        }
        .light-theme .picker-label {
          color: #475569;
        }
        .value-display {
          margin-top: 14px;
          font-size: 12px;
          color: #38bdf8;
          font-weight: 600;
          font-family: monospace;
          background: rgba(56, 189, 248, 0.1);
          padding: 6px 10px;
          border-radius: 8px;
          display: inline-block;
        }
        .light-theme .value-display {
          color: #0284c7;
          background: rgba(2, 132, 199, 0.08);
        }
        .full-width-card {
          grid-column: 1 / -1;
        }
        .interval-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .interval-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .interval-btn.active {
          background: var(--ctp-primary, #38bdf8);
          border-color: var(--ctp-primary, #38bdf8);
          color: #fff;
        }
        .light-theme .interval-btn {
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .light-theme .interval-btn:hover {
          background: rgba(0, 0, 0, 0.08);
        }
        .light-theme .interval-btn.active {
          background: var(--ctp-primary, #0284c7);
          border-color: var(--ctp-primary, #0284c7);
          color: #fff;
        }
      `}</style>

      <div className="demo-wrapper">
        <header className="demo-header">
          <h1 className="demo-title">Clock Time Picker Sandbox</h1>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        <div className="demo-grid">
          <div className="picker-card">
            <span className="picker-label">Standard Picker (Start Time)</span>
            <ClockTimePicker
              id="time-start"
              label="Start Shift"
              value={time1}
              onChange={setTime1}
              placeholder="e.g. 09:00"
            />
            <div className="value-display">Value: "{time1}"</div>
          </div>

          <div className="picker-card">
            <span className="picker-label">Custom Label (Finish Time)</span>
            <ClockTimePicker
              id="time-finish"
              label="End Shift"
              value={time2}
              onChange={setTime2}
              placeholder="e.g. 17:00"
            />
            <div className="value-display">Value: "{time2}"</div>
          </div>

          <div className="picker-card">
            <span className="picker-label">Customizable Intervals (e.g. 5, 15, 30 min)</span>
            <ClockTimePicker
              id="time-custom-intervals"
              label="Select Time"
              value={time1}
              onChange={setTime1}
              intervals={[5, 15, 30]}
              interval={15}
            />
            <div className="value-display">Value: "{time1}"</div>
          </div>

          <div className="picker-card">
            <span className="picker-label">Fixed Snapping (No Selector - e.g. 10 min)</span>
            <ClockTimePicker
              id="time-fixed"
              label="10m Slots"
              value={time2}
              onChange={setTime2}
              intervals={[]}
              interval={10}
            />
            <div className="value-display">Value: "{time2}"</div>
          </div>

          <div className="picker-card full-width-card">
            <span className="picker-label">Disabled State</span>
            <ClockTimePicker
              id="time-disabled"
              label="Locked Input"
              value={timeDisabled}
              onChange={setTimeDisabled}
              disabled={true}
            />
            <div className="value-display">Value: "{timeDisabled}" (interactions disabled)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
