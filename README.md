# React Clock Time Picker 🕐

A premium, lightweight, interactive clock-face time picker for React. Select times dynamically with SVG geometry snapping, 3D card flips, and complete CSS variable-based customization.

![Screenshot of Clock Time Picker](example/Screenshot.png)

---

## Features

- **No Bloated Dependencies:** Driven purely by React state and math/SVG logic.
- **Configurable Snapping Intervals:** Dynamically snap mouse/touch angles to 1, 5, 10, 15, 30, or 60-minute increments.
- **Dynamic Day-Phase Indicators:** Center-hub Sun (☀️) and Moon (🌙) SVG indicators representing Midday vs. Midnight.
- **AM/PM Card Flip:** Transitions smoothly between AM and PM halves with a premium 3D Y-axis flip.
- **Modern Themeable CSS:** Fully responsive, supporting custom CSS custom properties and dark/light themes out of the box.

---

## Installation

Install the package via npm:

```bash
npm install react-clock-time-picker
```

---

## Usage

Import the component and its stylesheet in your React application:

```jsx
import React, { useState } from 'react';
import ClockTimePicker from 'react-clock-time-picker';
import 'react-clock-time-picker/dist/style.css';

function App() {
  const [time, setTime] = useState('09:00'); // Store time as "HH:MM" 24h format

  return (
    <div style={{ maxWidth: 300, margin: '50px auto' }}>
      <label htmlFor="time-input">Select Shift Start:</label>
      <ClockTimePicker
        id="time-input"
        label="Start Time"
        value={time}
        onChange={(newTime) => setTime(newTime)}
        interval={15} // Optional: 1, 5, 10, 15, 30, or 60-minute snapping
      />
      <p>Selected time in 24h format: {time}</p>
    </div>
  );
}

export default App;
```

---

## Developer Sandbox

You can run the interactive sandbox locally to test components during development:

1. Clone or navigate to the package directory.
2. Install local developer dependencies:
   ```bash
   npm install
   ```
3. Start the dev sandbox:
   ```bash
   npm run example:dev
   ```
4. Open [http://localhost:3005](http://localhost:3005) in your browser.

5. To compile the production build:
   ```bash
   npm run build
   ```

---

## API Reference

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `""` | The current selected time in 24-hour format `"HH:MM"` (e.g. `"14:30"`). |
| `onChange` | `(value: string) => void` | *Required* | Callback function fired when a slot is clicked. Receives new value as a `"HH:MM"` string. |
| `label` | `string` | `"Select Time"` | Heading text shown inside the picker header preview block. |
| `id` | `string` | `undefined` | ID attribute forwarded directly to the visible `<input>` element. |
| `className` | `string` | `""` | Custom class added to the outer wrapper `div` element. |
| `inputClassName` | `string` | `""` | Custom class appended to the visible text input field. |
| `buttonClassName`| `string` | `""` | Custom class appended to the toggle clock icon button. |
| `placeholder` | `string` | `"e.g. 09:00"` | Placeholder text displayed in the text input. |
| `disabled` | `boolean` | `false` | When true, disables interactions and input modification. |
| `interval` | `number` | `15` | The granularity of time slot selection in minutes. Accepted values: `1`, `5`, `10`, `15`, `30`, `60`. |
> [!WARNING]
> **Chronomaniac Mode (1-Minute Snapping):** Yes, for the absolute wildcards who demand surgeon-like, pixel-perfect 1-minute precision, we've enabled a 1-minute interval option. The component will happily segment the clock face into **720 invisible slices**.
> 
> To save your eyes and prevent the dial from rendering as a solid black void of despair, the UI only draws tick marks at 5-minute intervals. The selector pointer, however, will faithfully snap to every single minute coordinate. Best of luck navigating this with your morning coffee shakes!

---

## Customizing Themes & CSS Variables

The picker styling is fully driven by CSS custom properties. You can easily override these values globally or scoped within a container.

```css
/* Customizing themes within your own App.css */
.custom-picker-container {
  --ctp-primary: #8b5cf6;       /* Purple highlight hand and wedges */
  --ctp-primary-dark: #6d28d9;  /* Hover button color */
  --ctp-bg-input: #2e1065;      /* Dark purple text input background */
  --ctp-border-input: #4c1d95;  /* Border color for the picker input */
  --ctp-bg-panel: #1e1b4b;      /* Popover panel background */
}
```

The component also listens to `.light-theme` or `.ctp-light` classes on parent nodes to automatically apply light-theme defaults.

---

## Technical Details: How the Math Works

The selector geometry relies on converting client-side mouse/touch coordinates into SVG polar angles relative to the clock center:

1. **Mouse Tracking (`getSlotFromEvent`):** On mouse movement or clicking within the SVG container, the coordinates relative to the SVG center $(120, 120)$ are computed:
   $$\text{dx} = \text{mouseX} - 120$$
   $$\text{dy} = \text{mouseY} - 120$$

2. **Angle Computation:** The angle relative to 12 o'clock is calculated using `Math.atan2`:
   $$\text{angle} = \text{atan2}(dy, dx) \times \frac{180}{\pi} + 90$$

3. **Interval Snapping:** The $360^\circ$ circle is divided into $48$ slots of $7.5^\circ$ each (which maps to 15-minute segments across 12 hours):
   $$\text{slotIndex} = \text{round}\left(\frac{\text{angle}}{7.5}\right) \pmod{48}$$

4. **Annular Wedge Generation (`wedgePath`):** To render the premium circular highlights on hover and selection, the component generates an SVG path comprising two concentric arcs (outer radius and inner hub radius) bounding the specific $7.5^\circ$ slice slot.

---

## License

This project is licensed under the MIT License.
