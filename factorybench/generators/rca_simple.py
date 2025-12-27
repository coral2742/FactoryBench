import random
import uuid
import numpy as np
from typing import List, Dict, Any

def generate_batch(count: int = 100, fault_ratio: float = 0.2) -> List[Dict[str, Any]]:
    """
    Generates a batch of synthetic samples for RCA testing using a 
    simplified variation strategy.
    
    Args:
        count: Number of samples to generate.
        fault_ratio: Approximate percentage of samples that should be anomalous.
    
    Returns:
        A list of sample dictionaries matching the schema.
    """
    samples = []
    
    for i in range(count):
        is_anomaly = random.random() < fault_ratio
        sample_id = f"sample_syn_{uuid.uuid4().hex[:8]}"
        
        # 1 metrics point per minute
        duration = 60
        length = 60

        # Normal pressure is like 150, anomaly drops to 80-90
        base_pressure = 150.0
        pressure_noise = np.random.normal(0, 5, length)
        pressure = base_pressure + pressure_noise
        
        # Normal temp is like 60, anomaly drops to 40-50 
        base_temp = 60.0
        temp_noise = np.random.normal(0, 2, length)
        temp = base_temp + temp_noise
        
        # Cycle time like 200ms, anomaly spikes to 350ms
        base_cycle = 200.0
        cycle_noise = np.random.normal(0, 10, length)
        cycle_time = base_cycle + cycle_noise
        
        ground_truth = {}
        
        if is_anomaly:
            # Fault of Hydraulic Leak -> Pressure drop, Cycle time increase
            # random start/end window
            start_idx = random.randint(10, 40)
            duration_fault = random.randint(10, 20)
            end_idx = min(start_idx + duration_fault, length)
            
            # fault effects
            # drop to ~90
            pressure[start_idx:end_idx] -= 60
            # spike to ~350
            cycle_time[start_idx:end_idx] += 150
            
            ground_truth = {
                "root_cause_component": "Hydraulic Pump",
                "root_cause_metric": "pressure",
                "anomaly_start": start_idx,
                "anomaly_end": end_idx,
                "description": "Hydraulic leak causing pressure drop and press slowdown."
            }
        else:
            ground_truth = {
                "root_cause_component": "None",
                "root_cause_metric": "None",
                "anomaly_start": -1,
                "anomaly_end": -1,
                "description": "Normal operation."
            }
            
        sample = {
            "id": sample_id,
            "meta": {
                "topology": "Hydraulic Pump -> Press Machine",
                "duration_minutes": duration
            },
            "ground_truth": ground_truth,
            "metrics": {
                "pump_pressure": pressure.tolist(),
                "pump_temp": temp.tolist(),
                "press_cycle_time": cycle_time.tolist()
            }
        }
        samples.append(sample)
        
    return samples
