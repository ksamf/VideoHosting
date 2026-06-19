package database

const (
	VideoStatusProcessing = "processing"
	VideoStatusUploaded   = "uploaded"
	VideoStatusFailed     = "failed"

	legacyVideoStatusProcessed = "processed"
)

func IsFinalVideoStatus(status string) bool {
	switch status {
	case VideoStatusUploaded, VideoStatusFailed, legacyVideoStatusProcessed:
		return true
	default:
		return false
	}
}
