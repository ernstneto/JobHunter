package handlers

import (
	"fmt"
	"io"
	"net/http"
	"net/url"

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
	query := c.Query("q")
	location := c.Query("location")
	remote := c.Query("remote")

	params := url.Values{}
	params.Set("q", query)
	if location != "" {
		params.Set("location", location)
	}
	if remote == "true" || remote == "false" {
		params.Set("remote", remote)
	}

	aiURL := fmt.Sprintf("%s/api/v1/jobs/search?%s", h.cfg.AIServiceURL, params.Encode())
	resp, err := http.Get(aiURL)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI service unavailable"})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	c.Data(resp.StatusCode, "application/json", body)
}

func (h *JobHandler) GetByID(c *gin.Context) {
	jobID := c.Param("id")
	aiURL := fmt.Sprintf("%s/api/v1/jobs/%s", h.cfg.AIServiceURL, jobID)

	resp, err := http.Get(aiURL)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI service unavailable"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	c.Data(resp.StatusCode, "application/json", body)
}

func (h *JobHandler) TriggerScrape(c *gin.Context) {
	aiURL := fmt.Sprintf("%s/api/v1/jobs/scrape", h.cfg.AIServiceURL)

	resp, err := http.Post(aiURL, "application/json", c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to trigger scrape"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	c.Data(resp.StatusCode, "application/json", body)
}