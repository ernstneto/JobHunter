package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type CVHandler struct {
	cfg *config.Config
}

func NewCVHandler(cfg *config.Config) *CVHandler {
	return &CVHandler{cfg: cfg}
}

func (h *CVHandler) Quiz(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/cv/quiz")
}

func (h *CVHandler) Generate(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/cv/generate")
}

func (h *CVHandler) ListVersions(c *gin.Context) {
	c.JSON(200, gin.H{"versions": []gin.H{}, "total": 0})
}

func (h *CVHandler) GetVersion(c *gin.Context) {
	c.JSON(200, gin.H{"id": c.Param("id"), "message": "TODO"})
}
