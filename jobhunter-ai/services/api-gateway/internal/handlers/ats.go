package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type ATSHandler struct {
	cfg *config.Config
}

func NewATSHandler(cfg *config.Config) *ATSHandler {
	return &ATSHandler{cfg: cfg}
}

func (h *ATSHandler) Analyze(c *gin.Context) {
	aiURL := fmt.Sprintf("%s/api/v1/ats/analyze", h.cfg.AIServiceURL)
	resp, err := http.Post(aiURL, "application/json", c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI service unavailable"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	c.Data(resp.StatusCode, "application/json", body)
}