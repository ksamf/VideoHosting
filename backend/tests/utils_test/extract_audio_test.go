package utils_tests

import (
	"testing"

	"github.com/ksamf/VideoHosting/backend/internal/utils"
	"github.com/stretchr/testify/assert"
)

func TestExtractAudio_NotFound(t *testing.T) {
	t.Parallel()
	_, err := utils.ExtractAudio("none.mp4", "test-file")
	assert.Error(t, err)
}
