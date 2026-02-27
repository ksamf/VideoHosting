package utils_tests

import (
	"context"
	"testing"

	"github.com/ksamf/VideoHosting/backend/internal/testutil"
	"github.com/ksamf/VideoHosting/backend/internal/utils"
	"github.com/stretchr/testify/assert"
)

func TestTranscode_InputNotFound(t *testing.T) {
	t.Parallel()

	mockStorage := &testutil.MockStorage{}
	err := utils.Transcode(context.Background(), mockStorage, "none.mp4", "test-file", 240, 24, "libx264")
	assert.Error(t, err)
}
