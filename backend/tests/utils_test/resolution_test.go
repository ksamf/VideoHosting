package utils_tests

import (
	"testing"

	"github.com/ksamf/VideoHosting/backend/internal/utils"
	"github.com/stretchr/testify/assert"
)

func TestGetResolution_NotFound(t *testing.T) {
	t.Parallel()
	_, _, err := utils.GetResolution("none.mp4")
	assert.Error(t, err)
}
