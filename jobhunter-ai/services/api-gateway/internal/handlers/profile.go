package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type ProfileHandler struct {
	cfg *config.Config
}

func NewProfileHandler(cfg *config.Config) *ProfileHandler {
	return &ProfileHandler{cfg: cfg}
}

// ParseLinkedIn repassa o upload do PDF do LinkedIn para o ai-service.
func (h *ProfileHandler) ParseLinkedIn(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/profile/parse-linkedin")
}

// GetGitHub repassa a consulta de perfil GitHub para o ai-service.
func (h *ProfileHandler) GetGitHub(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/profile/github/"+c.Param("username"))
}
