import cv2
import mediapipe as mp
import numpy as np
from ultralytics import YOLO

# Load YOLOv8 Model (using COCO dataset classes)
model = YOLO("yolov8l.pt")

# Initialize MediaPipe Face Mesh with optimized parameters
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    refine_landmarks=True,
    static_image_mode=False,
    max_num_faces=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# Define Iris and Eye Corner Landmarks
LEFT_IRIS = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]
LEFT_EYE_CORNERS = [33, 133]
RIGHT_EYE_CORNERS = [362, 263]

def get_gaze_direction(face_landmarks, frame_width):
    """Improved gaze detection with accurate iris position calculation"""
    # Calculate iris positions correctly
    left_iris = np.mean([face_landmarks[i].x for i in LEFT_IRIS]) * frame_width
    right_iris = np.mean([face_landmarks[i].x for i in RIGHT_IRIS]) * frame_width

    # Get eye corners
    left_corners = [face_landmarks[i].x * frame_width for i in LEFT_EYE_CORNERS]
    right_corners = [face_landmarks[i].x * frame_width for i in RIGHT_EYE_CORNERS]

    # Calculate relative positions with error handling
    try:
        left_relative = (left_iris - left_corners[0]) / (left_corners[1] - left_corners[0])
        right_relative = (right_iris - right_corners[0]) / (right_corners[1] - right_corners[0])
    except ZeroDivisionError:
        return "Eye Closed"

    avg_relative = (left_relative + right_relative) / 2

    # Adjusted thresholds based on empirical testing
    if avg_relative < 0.4:
        return "Looking Left"
    elif avg_relative > 0.6:
        return "Looking Right"
    else:
        return "Looking Center"

cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Convert to RGB once for both face mesh and YOLO
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Face mesh processing
    face_results = face_mesh.process(rgb_frame)
    face_count = 0

    if face_results.multi_face_landmarks:
        face_count = len(face_results.multi_face_landmarks)

        for face_landmarks in face_results.multi_face_landmarks:
            # Gaze detection
            gaze_direction = get_gaze_direction(face_landmarks.landmark, frame.shape[1])
            cv2.putText(frame, f'Gaze: {gaze_direction}', (30, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # Improved face bounding box using all landmarks
            x_coords = [lm.x * frame.shape[1] for lm in face_landmarks.landmark]
            y_coords = [lm.y * frame.shape[0] for lm in face_landmarks.landmark]
            cv2.rectangle(frame,
                         (int(min(x_coords)), int(min(y_coords))),
                         (int(max(x_coords)), int(max(y_coords))),
                         (255, 0, 0), 2)

    # Multiple face alert
    if face_count > 1:
        cv2.putText(frame, "⚠ Multiple Faces Detected!", (30, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    # YOLO object detection with RGB input
    yolo_results = model.predict(rgb_frame, conf=0.6, verbose=False)

    for result in yolo_results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            label = result.names[int(box.cls[0])]
            confidence = float(box.conf[0])

            # Detect only COCO-valid cheating-related objects
            if label in ["cell phone", "laptop", "face","books"]:
                # Draw detection with confidence
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, f"⚠ {label} ({confidence:.2f})",
                           (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    # Display the frame with detected face and objects
    cv2.imshow("Enhanced Cheating Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()