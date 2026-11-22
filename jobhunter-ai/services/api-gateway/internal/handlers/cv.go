package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type CVHandler struct {
	cfg *config.Config
}

func NewCVHandler(cfg *config.Config) *CVHandler {
	return &CVHandler{cfg: cfg}
}

func (h *CVHandler) Generate(c *gin.Context) {
	aiURL := fmt.Sprintf("%s/api/v1/cv/generate", h.cfg.AIServiceURL)
	resp, err := http.Post(aiURL, "application/json", c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI service unavailable"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	c.Data(resp.StatusCode, "application/json", body)
}

func (h *CVHandler) ListVersions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"versions": []gin.H{}, "total": 0})
}

func (h *CVHandler) GetVersion(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"id": c.Param("id"), "message": "TODO"})
}