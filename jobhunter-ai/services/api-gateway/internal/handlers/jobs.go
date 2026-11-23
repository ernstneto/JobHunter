package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type JobHandler struct {
	cfg *config.Config
}

func NewJobHandler(cfg *config.Config) *JobHandler {
	return &JobHandler{cfg: cfg}
}

func (h *JobHandler) Search(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/jobs/search")
}

func (h *JobHandler) GetByID(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/jobs/"+c.Param("id"))
}

func (h *JobHandler) TriggerScrape(c *gin.Context) {
	proxyRequest(h.cfg, c, "/api/v1/jobs/scrape")
}
