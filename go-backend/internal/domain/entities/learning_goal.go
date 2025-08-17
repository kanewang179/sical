package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LearningGoal 学习目标实体
type LearningGoal struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Category    string    `gorm:"type:varchar(100);not null" json:"category"`
	Difficulty  string    `gorm:"type:varchar(50);not null" json:"difficulty"` // beginner, intermediate, advanced
	Status      string    `gorm:"type:varchar(50);not null;default:'active'" json:"status"` // active, completed, paused
	TargetDate  *time.Time `gorm:"type:timestamp" json:"target_date"`
	Progress    float64   `gorm:"type:decimal(5,2);default:0" json:"progress"` // 0-100
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联关系
	User         User                `gorm:"foreignKey:UserID" json:"user,omitempty"`
	LearningPath []LearningPath      `gorm:"foreignKey:GoalID" json:"learning_paths,omitempty"`
	Analysis     []GoalAnalysis      `gorm:"foreignKey:GoalID" json:"analysis,omitempty"`
}

// GoalAnalysis 学习目标分析结果
type GoalAnalysis struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	GoalID           uuid.UUID `gorm:"type:uuid;not null;index" json:"goal_id"`
	AnalysisType     string    `gorm:"type:varchar(50);not null" json:"analysis_type"` // skill_gap, prerequisite, difficulty_assessment
	Result           string    `gorm:"type:jsonb" json:"result"`
	Recommendations  string    `gorm:"type:jsonb" json:"recommendations"`
	ConfidenceScore  float64   `gorm:"type:decimal(3,2)" json:"confidence_score"` // 0-1
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// 关联关系
	LearningGoal LearningGoal `gorm:"foreignKey:GoalID" json:"learning_goal,omitempty"`
}

// LearningPath 学习路径
type LearningPath struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	GoalID      uuid.UUID `gorm:"type:uuid;not null;index" json:"goal_id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Order       int       `gorm:"not null" json:"order"`
	EstimatedDuration int `gorm:"not null" json:"estimated_duration"` // 预估学习时间(小时)
	Status      string    `gorm:"type:varchar(50);not null;default:'pending'" json:"status"` // pending, in_progress, completed
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联关系
	LearningGoal LearningGoal `gorm:"foreignKey:GoalID" json:"learning_goal,omitempty"`
	KnowledgePoints []KnowledgePoint `gorm:"many2many:path_knowledge_points;" json:"knowledge_points,omitempty"`
}

// KnowledgePoint 知识点
type KnowledgePoint struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Category    string    `gorm:"type:varchar(100);not null" json:"category"`
	Difficulty  string    `gorm:"type:varchar(50);not null" json:"difficulty"`
	Content     string    `gorm:"type:text" json:"content"`
	Resources   string    `gorm:"type:jsonb" json:"resources"` // 学习资源链接等
	Prerequisites string  `gorm:"type:jsonb" json:"prerequisites"` // 前置知识点
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联关系
	LearningPaths []LearningPath `gorm:"many2many:path_knowledge_points;" json:"learning_paths,omitempty"`
}