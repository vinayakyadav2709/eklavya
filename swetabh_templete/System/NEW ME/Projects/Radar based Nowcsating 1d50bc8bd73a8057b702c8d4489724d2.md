# Radar based Nowcsating

Owner: Vinayak Yadav

**Comprehensive Nowcasting Plan: Hybrid Optical Flow + Deep Learning with Radar & ERA5 Fusion**

**Phase 1: Data Acquisition, Preparation, and Fusion**

1. **Data Sources:**
    - **Radar:**
        - Reflectivity (e.g., CAPPI/Composite Reflectivity): Primary field. Resolution: Variable (e.g., 250m - 1km). Temporal Frequency: High (e.g., 5-10 mins).
        - Radial Velocity: Optional, for dynamics. Same resolution/frequency.
    - **ERA5 Reanalysis Data (Source for Environmental Context):**
        - *Spatial Resolution:* Typically ~0.25 degrees (~31 km).
        - *Temporal Resolution:* Hourly.
        - *Variables to Extract (Examples):*
            - **Thermodynamic Predictors:** Temperature (e.g., at 850hPa, 700hPa, surface), Specific Humidity/Dew Point, U/V Wind Components (at various levels), CAPE (Convective Available Potential Energy), Vertical Velocity (Omega), Surface Pressure, Geopotential Height.
            - **Satellite Proxies (Derived from ERA5 model state):** Total Cloud Cover, High/Medium/Low Cloud Cover, Total Column Water Vapor (TCWV), potentially Cloud Liquid Water Content (CLWC) / Cloud Ice Water Content (CIWC). *Note: These are model-derived fields, not direct satellite measurements.*
    - **Optical Flow Output:**
        - Advection/Motion Fields (U, V components) derived from radar reflectivity sequences (Generated in Phase 2). Resolution: Same as target radar grid. Temporal Frequency: Same as target time step.
2. **Spatio-Temporal Alignment and Resolution Matching (Key Challenge):**
    - **Define Target Grid & Time Step:** Select a reference spatial grid (likely the radar grid, e.g., 1km) and a target time step (matching the radar scan interval, e.g., 10 minutes).
    - **Spatial Upsampling of ERA5:** Interpolate the coarse (~31km) ERA5 variables (both thermodynamic and satellite proxies) onto the finer target radar grid (e.g., 1km). **Bilinear interpolation** is a common choice for continuous fields. *Crucially acknowledge that this upsampling creates smooth fields lacking the fine-scale detail of the radar data.*
    - **Temporal Interpolation of ERA5:** Interpolate the hourly ERA5 variables to match the finer target time steps (e.g., every 10 minutes). **Linear interpolation** between hourly points is standard.
    - **Radar Alignment:** Ensure radar data is mapped to the target grid (if different from native resolution) and uses the target time steps.
    - **Result:** A unified dataset where Radar Reflectivity, Radial Velocity (optional), upsampled/interpolated ERA5 variables, and derived OF fields exist on the same spatial grid (H x W) and at the same time steps (T).
3. **Data Normalization/Standardization:** Scale all input channels (Radar, ERA5 variables, OF vectors) to a suitable range (e.g., 0-1 or Z-score) based on training set statistics.
4. **Input Tensor Formation:** Create input sequences of shape T x C x H x W.
    - T: Number of time steps in the input sequence (e.g., 6 steps of 10 mins = 1 hour history).
    - C: Number of channels. This will include:
        - Radar Reflectivity (at time t, t-1, ...)
        - Optical Flow U-component (derived for t-1 to t, etc.)
        - Optical Flow V-component (derived for t-1 to t, etc.)
        - Upsampled/Interpolated ERA5 Variable 1 (e.g., Total Cloud Cover) (at time t, t-1, ...)
        - Upsampled/Interpolated ERA5 Variable 2 (e.g., CAPE) (at time t, t-1, ...)
        - Upsampled/Interpolated ERA5 Variable 3 (e.g., T @ 850hPa) (at time t, t-1, ...)
        - ... potentially Radial Velocity and other selected ERA5 fields.
    - H, W: Height and Width of the target spatial grid.
5. **Data Splitting:** Split data chronologically into Training, Validation, and Test sets.

**Phase 2: Optical Flow Evaluation and Selection**

1. **Goal:** Identify the best OF method(s) for tracking radar precipitation patterns to provide reliable advection fields.
2. **Candidate Algorithms:**
    - **Traditional Dense:** Horn-Schunck (HS), Farnebäck.
    - **Traditional Local:** Lucas-Kanade (LK) (sparse/dense).
    - **Meteorology-Specific:** VET, DARTS.
    - **Conceptual/Systems:** TITAN tracking logic, STEPS approach.
    - **Deep Learning Based (Advanced):** RAFT, FlowNet/FlowNet2, PWC-Net.
3. **Method:** Apply selected algorithms to radar reflectivity sequences on the target grid.
4. **Evaluation:** Predict future frames via advection. Compare with actual frames using MSE, SSIM, CSI.
5. **Selection:** Choose the OF algorithm(s) providing the most accurate motion fields for use as DL input.

**Phase 3: Deep Learning Model Development (Focus on Genesis/Lysis)**

1. **Goal:** Train a spatio-temporal DL model to predict future radar reflectivity, learning genesis/lysis by leveraging the combined input (radar, OF motion, interpolated ERA5 context).
2. **Model Candidates (Handling T x C x H x W Input):**
    - **ConvLSTM:** Strong baseline for spatio-temporal sequences.
    - **PredRNN / PredRNN++:** Enhanced spatio-temporal modeling.
    - **TrajGRU:** Adapts internal connections based on flow/dynamics.
    - **3D CNNs:** Learns local spatio-temporal features directly.
    - **CNN + RNN Hybrid Architectures:** Separates spatial (CNN) and temporal (RNN) feature extraction.
3. **Input:** The T x C x H x W tensors prepared in Phase 1 (including radar, selected OF vectors, and interpolated ERA5 variables).
4. **Output:** Predicted future radar reflectivity frame(s) (T_out x 1 x H x W).
5. **Loss Function:** MSE, MAE, potentially weighted or skill-score based.
6. **Training:** Train on the training set, optimize using the validation set.

**Phase 4: Hybrid Integration**

1. **Strategy:** Primarily use the "OF as Input" method. Include the selected U/V motion fields from Phase 2 as input channels to the chosen DL model (Phase 3).
2. **Rationale:** Explicit motion context from OF allows the DL model to better focus on learning genesis/lysis/intensity changes influenced by the radar evolution and the broader atmospheric environment provided by the interpolated ERA5 data.

**Phase 5: Comprehensive Evaluation and Refinement**

1. **Comparison Baselines:** Persistence, Pure OF Advection, DL Model (No OF), DL Model (No ERA5 context).
2. **Evaluation Metrics:** Pixel-wise (MSE, MAE), Spatial (SSIM, FSS), Threshold-based (CSI, POD, FAR, H KSS at various dBZ levels).
3. **Qualitative Analysis:** Visual inspection focusing on genesis/lysis events, realism of predicted structures (considering the smoothness of ERA5 inputs).
4. **Ablation Studies:** Quantify the contribution of OF vectors and the ERA5-derived channels.
5. **Iteration:** Refine model architecture, features, hyperparameters based on results. Consider limitations imposed by ERA5 resolution.

Questions: 

1. is it possible to get 3d data
2. temporal alignment