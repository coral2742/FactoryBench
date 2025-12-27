# Proposal: RCA Synthetic Data

## Example
```bash
python -m factorybench.cli generate-data --count 1000 --output datasets/rca_v1.json
```

## Input Format (The "Problem")
The AI model receives a JSON object representing a specific operational window (example: 60 minutes).

```json
"meta": {
  "topology": "Hydraulic Pump -> Press Machine",
  "duration_minutes": 60
},
"metrics": {
  "pump_pressure": [150.2, 149.8, 151.1, ...],  // Noisy sensor data
  "pump_temp": [60.1, 60.3, 59.9, ...],        // Correlated variable
  "press_cycle_time": [200.5, 199.8, ...]      // Downstream effect
}
```

### Context (meta)
Information about the machine, Symbolic Knowledge:
- **Topology**: How machines are connected. This provides the Symbolic Knowledge. (example: "Hydraulic Pump -> Press Machine")
- **Duration (minutes)**: How long the window is (example: 60).

### Sensor Data (metrics)
The actual data from the sensors:
- **Pressure**: noisy sensor data (bar)
- **Temperature**: correlated variable (°C)
- **Cycle Time**: downstream effect (seconds)

## Output Format
We need to verify if the AI understood the problem. The ground truth contains:
```json
"ground_truth": {
  "root_cause_component": "Hydraulic Pump",
  "root_cause_metric": "pressure",
  "anomaly_start": 25,
  "anomaly_end": 40,
  "description": "Hydraulic leak caused pressure drop."
}
```

### Identification (What)
- **Component (root_cause_component)**: Which part broke? (example: "Hydraulic Pump")
- **Metric (root_cause_metric)**: Which sensor showed the first symptom? (example: "pressure")

### Localization (When)
- **Start (anomaly_start)**: The exact moment the fault started.
- **End (anomaly_end)**: The exact moment the fault ended.

### Description (Why)
- **Description (description)**: A short description of the fault.
