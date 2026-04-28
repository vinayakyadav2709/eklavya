# Voice Qube

Owner: Vinayak Yadav

PROCTORING LIBRARY EVENTS REFERENCE*

*AI-BASED EVENTS (Probabilistic)*
These depend on Computer Vision and Audio Processing. Accuracy varies based on lighting and system performance.

*Visual & Gaze Detection*

- GAZE_AWAY: Candidate looking away from the screen.
- EYES_OFF_SCREEN: Eyes not focused on the screen.
- LOOKING_LEFT / RIGHT / DOWN / UP: Specific gaze directions.
- SUSTAINED_LOOK_AWAY: Looking away for more than 3 seconds.
- SUSPICIOUS_GAZE_READING: Focused reading detected (AI gaze + blink check).
- EYES_CLOSED: Eyes closed for more than 2 seconds.

*Face, Head & Body*

- NO_FACE: No face detected in frame.
- MULTIPLE_FACES: More than one person detected.
- PERSON_LEFT: Extended absence (No face + 5s timer).
- HEAD_TURNED: Significant rotation (side to side).
- HEAD_TILTED: Significant tilt (up or down).
- HAND_NEAR_FACE: Hand detected near the face area.
- HAND_COVERING_FACE: Hand blocking the face.
- PHONE_DETECTED: Hand pose suggesting phone usage.
- MOUTH_MOVING: General mouth movement detected.

*Objects & Audio*

- SUSPICIOUS_OBJECT: Detection of cell phones, laptops, or books.
- TALKING_DETECTED: Sustained speech (audio FFT or mouth variance).
- WHISPERING_DETECTED: Low-level speech above the noise floor.

---

*STATIC / RULE-BASED EVENTS (Deterministic)*
These are 100% accurate, relying on standard Browser/DOM APIs.

*Browser Telemetry*

- TAB_SWITCHED / RETURNED: Browser visibility changes.
- WINDOW_FOCUS_LOST / RESTORED: Window focus status.
- RIGHT_CLICK: Context menu usage.
- COPY / PASTE / CUT_ATTEMPT: Clipboard actions.
- SUSPICIOUS_KEY_PRESS: Restricted shortcuts (Ctrl+C, Alt+Tab, etc.).
- ENTERED / EXITED_FULLSCREEN: Screen mode changes.
- MOUSE_LEFT / ENTERED_WINDOW: Cursor movement.

Screen Capture

- SCREEN_SHARE_STARTED / DENIED: Permission status for getDisplayMedia.
- SCREEN_SHARE_NOT_FULLSCREEN: Sharing only a tab/window instead of the monitor.
- SCREEN_FRAME_CAPTURED: Periodic canvas snapshots.
- SCREEN_SHARE_INTERRUPTED: User stopped sharing mid-session.

*REMAINING TASKS*

- Tuning AI thresholds and parameters for higher accuracy.
- Finalizing the report structure (need input on required detail levels).

1. Posture detection and recommendation - professional and upright must be checked
2. Confident body language, nervous or confidence%
3. Presentation score: good hair, clean face and good attire
4. Video quality score
5. Camera angle recommendation. It needs to be straight and not tilted down or sideways