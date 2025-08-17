# 知识库管理 API 接口文档

## 版本信息
- **API版本**: v1.0.0
- **最后更新**: 2024-01-15
- **文档版本**: 1.0.0
- **维护团队**: SiCal后端团队

## 更新日志
- v1.0.0 (2024-01-15): 初始版本，定义知识库管理API接口

---

## 1. 接口概览

### 1.1 基础信息
- **Base URL**: `https://api.sical.edu/v1`
- **协议**: HTTPS
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时区**: UTC

### 1.2 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "title",
        "message": "标题不能为空"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

#### 分页响应格式
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 1.3 请求头要求
```http
Content-Type: application/json
Authorization: Bearer <access_token>
X-Request-ID: <unique_request_id>
X-Client-Version: <client_version>
```

---

## 2. 知识管理接口

### 2.1 创建知识

**接口地址**: `POST /knowledge`

**请求参数**:
```json
{
  "title": "心脏解剖学基础",
  "summary": "介绍心脏的基本解剖结构和功能",
  "content": {
    "type": "html",
    "data": "<h1>心脏解剖学</h1><p>心脏是人体循环系统的核心器官...</p>",
    "attachments": [
      {
        "type": "image",
        "name": "心脏解剖图.jpg",
        "url": "/uploads/heart-anatomy.jpg",
        "size": 1024000,
        "metadata": {
          "width": 1920,
          "height": 1080,
          "format": "jpeg"
        }
      }
    ]
  },
  "category": {
    "primary": "解剖学",
    "secondary": "心血管系统",
    "tags": ["心脏", "解剖", "基础医学", "循环系统"]
  },
  "metadata": {
    "difficulty": "beginner",
    "estimatedTime": 30,
    "language": "zh-CN",
    "keywords": ["心脏", "解剖学", "心房", "心室", "瓣膜"]
  },
  "collaborators": [
    {
      "userId": "507f1f77bcf86cd799439013",
      "role": "editor"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "心脏解剖学基础",
    "status": {
      "current": "draft",
      "lastModified": "2024-01-15T10:30:00Z"
    },
    "version": "1.0.0",
    "author": {
      "userId": "507f1f77bcf86cd799439012",
      "name": "张教授",
      "institution": "北京大学医学部"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2.2 获取知识详情

**接口地址**: `GET /knowledge/{id}`

**路径参数**:
- `id` (string): 知识ID

**查询参数**:
- `includeContent` (boolean): 是否包含完整内容，默认true
- `includeStatistics` (boolean): 是否包含统计信息，默认true
- `includeRelations` (boolean): 是否包含关联信息，默认true

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "心脏解剖学基础",
    "summary": "介绍心脏的基本解剖结构和功能",
    "content": {
      "type": "html",
      "data": "<h1>心脏解剖学</h1>...",
      "attachments": [
        {
          "type": "image",
          "name": "心脏解剖图.jpg",
          "url": "/uploads/heart-anatomy.jpg",
          "size": 1024000,
          "metadata": {
            "width": 1920,
            "height": 1080
          }
        }
      ]
    },
    "category": {
      "primary": "解剖学",
      "secondary": "心血管系统",
      "tags": ["心脏", "解剖", "基础医学"]
    },
    "author": {
      "userId": "507f1f77bcf86cd799439012",
      "name": "张教授",
      "institution": "北京大学医学部",
      "avatar": "/avatars/zhang-prof.jpg"
    },
    "collaborators": [
      {
        "userId": "507f1f77bcf86cd799439013",
        "name": "李医生",
        "role": "editor",
        "joinedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "status": {
      "current": "published",
      "publishedAt": "2024-01-15T12:00:00Z",
      "lastModified": "2024-01-15T11:30:00Z"
    },
    "quality": {
      "score": 4.5,
      "reviewCount": 12,
      "reviews": [
        {
          "reviewerId": "507f1f77bcf86cd799439014",
          "reviewerName": "王教授",
          "score": 5,
          "comment": "内容详实，图文并茂，非常适合初学者",
          "reviewedAt": "2024-01-15T13:00:00Z"
        }
      ],
      "certifications": [
        {
          "type": "expert_reviewed",
          "authority": "中华医学会",
          "certifiedAt": "2024-01-15T14:00:00Z"
        }
      ]
    },
    "statistics": {
      "views": 1250,
      "likes": 89,
      "shares": 23,
      "downloads": 156,
      "comments": 15,
      "bookmarks": 67
    },
    "relations": {
      "references": [
        {
          "id": "507f1f77bcf86cd799439015",
          "title": "人体解剖学概论",
          "type": "prerequisite"
        }
      ],
      "related": [
        {
          "id": "507f1f77bcf86cd799439016",
          "title": "心脏生理学",
          "similarity": 0.85
        }
      ],
      "citedBy": [
        {
          "id": "507f1f77bcf86cd799439017",
          "title": "心血管疾病诊断",
          "citedAt": "2024-01-16T09:00:00Z"
        }
      ]
    },
    "metadata": {
      "difficulty": "beginner",
      "estimatedTime": 30,
      "language": "zh-CN",
      "keywords": ["心脏", "解剖学", "心房", "心室"],
      "version": "1.2.0",
      "source": "original"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### 2.3 更新知识

**接口地址**: `PUT /knowledge/{id}`

**路径参数**:
- `id` (string): 知识ID

**请求参数**:
```json
{
  "title": "心脏解剖学基础（更新版）",
  "summary": "更新后的心脏解剖结构介绍",
  "content": {
    "type": "html",
    "data": "<h1>心脏解剖学（更新版）</h1>..."
  },
  "changeDescription": "添加了最新的研究成果和高清解剖图",
  "category": {
    "tags": ["心脏", "解剖", "基础医学", "最新研究"]
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "version": "1.3.0",
    "status": {
      "current": "draft",
      "lastModified": "2024-01-15T15:30:00Z"
    },
    "changes": {
      "type": "update",
      "description": "添加了最新的研究成果和高清解剖图",
      "modifiedFields": ["title", "summary", "content", "category.tags"]
    },
    "updatedAt": "2024-01-15T15:30:00Z"
  }
}
```

### 2.4 删除知识

**接口地址**: `DELETE /knowledge/{id}`

**路径参数**:
- `id` (string): 知识ID

**查询参数**:
- `force` (boolean): 是否强制删除，默认false（软删除）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "deleted",
    "deletedAt": "2024-01-15T16:00:00Z"
  }
}
```

### 2.5 获取知识列表

**接口地址**: `GET /knowledge`

**查询参数**:
- `page` (integer): 页码，默认1
- `size` (integer): 每页数量，默认20，最大100
- `category` (string): 分类筛选
- `author` (string): 作者筛选
- `status` (string): 状态筛选：draft/review/published/archived
- `difficulty` (string): 难度筛选：beginner/intermediate/advanced
- `tags` (string): 标签筛选，多个标签用逗号分隔
- `sortBy` (string): 排序字段：createdAt/updatedAt/views/likes/quality
- `sortOrder` (string): 排序方向：asc/desc，默认desc
- `search` (string): 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "心脏解剖学基础",
        "summary": "介绍心脏的基本解剖结构",
        "category": {
          "primary": "解剖学",
          "tags": ["心脏", "解剖"]
        },
        "author": {
          "name": "张教授",
          "institution": "北京大学医学部"
        },
        "status": {
          "current": "published",
          "publishedAt": "2024-01-15T12:00:00Z"
        },
        "quality": {
          "score": 4.5
        },
        "statistics": {
          "views": 1250,
          "likes": 89
        },
        "metadata": {
          "difficulty": "beginner",
          "estimatedTime": 30
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": [
        { "key": "解剖学", "count": 45 },
        { "key": "生理学", "count": 32 }
      ],
      "difficulties": [
        { "key": "beginner", "count": 78 },
        { "key": "intermediate", "count": 56 }
      ]
    }
  }
}
```

---

## 3. 搜索接口

### 3.1 全文搜索

**接口地址**: `GET /search`

**查询参数**:
- `q` (string): 搜索关键词，必填
- `page` (integer): 页码，默认1
- `size` (integer): 每页数量，默认20
- `category` (string): 分类筛选
- `difficulty` (string): 难度筛选
- `author` (string): 作者筛选
- `dateRange` (string): 时间范围，格式：2024-01-01,2024-01-31
- `sortBy` (string): 排序方式：relevance/date/popularity/quality
- `highlight` (boolean): 是否高亮显示，默认true

**响应示例**:
```json
{
  "success": true,
  "data": {
    "query": "心脏解剖",
    "total": 156,
    "took": 23,
    "results": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "心脏解剖学基础",
        "summary": "介绍心脏的基本解剖结构",
        "score": 0.95,
        "highlights": {
          "title": ["<em>心脏</em><em>解剖</em>学基础"],
          "content": ["<em>心脏</em>是人体最重要的器官之一，其<em>解剖</em>结构复杂..."]
        },
        "category": {
          "primary": "解剖学",
          "tags": ["心脏", "解剖"]
        },
        "author": {
          "name": "张教授",
          "institution": "北京大学医学部"
        },
        "statistics": {
          "views": 1250,
          "likes": 89
        },
        "publishedAt": "2024-01-15T12:00:00Z"
      }
    ],
    "aggregations": {
      "categories": [
        { "key": "解剖学", "count": 45 },
        { "key": "生理学", "count": 32 }
      ],
      "authors": [
        { "key": "张教授", "count": 12 },
        { "key": "李教授", "count": 8 }
      ],
      "difficulties": [
        { "key": "beginner", "count": 78 },
        { "key": "intermediate", "count": 45 }
      ]
    },
    "suggestions": [
      "心脏生理学",
      "心脏病理学",
      "心血管系统"
    ]
  }
}
```

### 3.2 搜索建议

**接口地址**: `GET /search/suggestions`

**查询参数**:
- `q` (string): 搜索前缀，必填
- `limit` (integer): 建议数量，默认10，最大20
- `type` (string): 建议类型：all/title/tag/author，默认all

**响应示例**:
```json
{
  "success": true,
  "data": {
    "query": "心脏",
    "suggestions": [
      {
        "text": "心脏解剖学",
        "type": "title",
        "count": 156,
        "category": "解剖学"
      },
      {
        "text": "心脏生理学",
        "type": "title",
        "count": 89,
        "category": "生理学"
      },
      {
        "text": "心脏",
        "type": "tag",
        "count": 234
      }
    ]
  }
}
```

### 3.3 高级搜索

**接口地址**: `POST /search/advanced`

**请求参数**:
```json
{
  "query": {
    "must": [
      {
        "field": "title",
        "value": "心脏",
        "operator": "contains"
      }
    ],
    "should": [
      {
        "field": "category.tags",
        "value": "解剖",
        "operator": "equals"
      }
    ],
    "mustNot": [
      {
        "field": "status.current",
        "value": "draft",
        "operator": "equals"
      }
    ]
  },
  "filters": {
    "dateRange": {
      "field": "createdAt",
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "numericRange": {
      "field": "quality.score",
      "min": 4.0,
      "max": 5.0
    }
  },
  "sort": [
    {
      "field": "quality.score",
      "order": "desc"
    },
    {
      "field": "createdAt",
      "order": "desc"
    }
  ],
  "page": 1,
  "size": 20
}
```

---

## 4. 分类管理接口

### 4.1 获取分类树

**接口地址**: `GET /categories`

**查询参数**:
- `includeCount` (boolean): 是否包含知识数量统计，默认false
- `maxDepth` (integer): 最大层级深度，默认无限制

**响应示例**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "507f1f77bcf86cd799439020",
        "name": "基础医学",
        "code": "basic_medicine",
        "description": "医学基础学科",
        "level": 1,
        "path": "/基础医学",
        "icon": "medical-book",
        "color": "#2196F3",
        "knowledgeCount": 234,
        "children": [
          {
            "id": "507f1f77bcf86cd799439021",
            "name": "解剖学",
            "code": "anatomy",
            "description": "人体结构学",
            "level": 2,
            "path": "/基础医学/解剖学",
            "knowledgeCount": 89,
            "children": [
              {
                "id": "507f1f77bcf86cd799439022",
                "name": "心血管系统",
                "code": "cardiovascular",
                "level": 3,
                "path": "/基础医学/解剖学/心血管系统",
                "knowledgeCount": 45
              }
            ]
          }
        ]
      }
    ],
    "statistics": {
      "totalCategories": 156,
      "maxDepth": 4,
      "totalKnowledge": 2345
    }
  }
}
```

### 4.2 创建分类

**接口地址**: `POST /categories`

**请求参数**:
```json
{
  "name": "神经系统",
  "code": "nervous_system",
  "description": "神经系统解剖与生理",
  "parent": "507f1f77bcf86cd799439021",
  "icon": "brain",
  "color": "#9C27B0",
  "order": 3
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439023",
    "name": "神经系统",
    "code": "nervous_system",
    "level": 3,
    "path": "/基础医学/解剖学/神经系统",
    "createdAt": "2024-01-15T16:30:00Z"
  }
}
```

---

## 5. 版本管理接口

### 5.1 获取版本历史

**接口地址**: `GET /knowledge/{id}/versions`

**路径参数**:
- `id` (string): 知识ID

**查询参数**:
- `page` (integer): 页码，默认1
- `size` (integer): 每页数量，默认20

**响应示例**:
```json
{
  "success": true,
  "data": {
    "knowledgeId": "507f1f77bcf86cd799439011",
    "currentVersion": "1.3.0",
    "versions": [
      {
        "version": "1.3.0",
        "title": "心脏解剖学基础（更新版）",
        "changes": {
          "type": "update",
          "description": "添加了最新的研究成果"
        },
        "author": {
          "userId": "507f1f77bcf86cd799439012",
          "name": "张教授"
        },
        "status": "published",
        "createdAt": "2024-01-15T15:30:00Z"
      },
      {
        "version": "1.2.0",
        "title": "心脏解剖学基础",
        "changes": {
          "type": "update",
          "description": "修正了部分描述错误"
        },
        "author": {
          "userId": "507f1f77bcf86cd799439012",
          "name": "张教授"
        },
        "status": "archived",
        "createdAt": "2024-01-15T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

### 5.2 获取版本详情

**接口地址**: `GET /knowledge/{id}/versions/{version}`

**路径参数**:
- `id` (string): 知识ID
- `version` (string): 版本号

**响应示例**:
```json
{
  "success": true,
  "data": {
    "knowledgeId": "507f1f77bcf86cd799439011",
    "version": "1.2.0",
    "title": "心脏解剖学基础",
    "content": {
      "type": "html",
      "data": "<h1>心脏解剖学</h1>..."
    },
    "changes": {
      "type": "update",
      "description": "修正了部分描述错误",
      "diff": {
        "added": ["新增内容..."],
        "removed": ["删除内容..."],
        "modified": ["修改内容..."]
      }
    },
    "author": {
      "userId": "507f1f77bcf86cd799439012",
      "name": "张教授"
    },
    "parentVersion": "1.1.0",
    "status": "archived",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### 5.3 版本比较

**接口地址**: `GET /knowledge/{id}/versions/compare`

**路径参数**:
- `id` (string): 知识ID

**查询参数**:
- `from` (string): 源版本号，必填
- `to` (string): 目标版本号，必填

**响应示例**:
```json
{
  "success": true,
  "data": {
    "knowledgeId": "507f1f77bcf86cd799439011",
    "comparison": {
      "from": {
        "version": "1.1.0",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      "to": {
        "version": "1.2.0",
        "createdAt": "2024-01-15T12:00:00Z"
      },
      "diff": {
        "title": {
          "changed": false
        },
        "content": {
          "changed": true,
          "additions": [
            {
              "line": 15,
              "content": "心脏由四个腔室组成：左心房、右心房、左心室、右心室。"
            }
          ],
          "deletions": [
            {
              "line": 12,
              "content": "心脏是一个简单的器官。"
            }
          ],
          "modifications": [
            {
              "line": 8,
              "from": "心脏位于胸腔中央。",
              "to": "心脏位于胸腔中央偏左的位置。"
            }
          ]
        },
        "category": {
          "changed": true,
          "from": ["心脏", "解剖"],
          "to": ["心脏", "解剖", "基础"]
        }
      },
      "statistics": {
        "totalChanges": 4,
        "additions": 1,
        "deletions": 1,
        "modifications": 2
      }
    }
  }
}
```

### 5.4 版本回滚

**接口地址**: `POST /knowledge/{id}/versions/{version}/rollback`

**路径参数**:
- `id` (string): 知识ID
- `version` (string): 目标版本号

**请求参数**:
```json
{
  "reason": "发现内容错误，回滚到稳定版本"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "knowledgeId": "507f1f77bcf86cd799439011",
    "newVersion": "1.4.0",
    "rolledBackTo": "1.2.0",
    "reason": "发现内容错误，回滚到稳定版本",
    "createdAt": "2024-01-15T17:00:00Z"
  }
}
```

---

## 6. 协作管理接口

### 6.1 添加协作者

**接口地址**: `POST /knowledge/{id}/collaborators`

**路径参数**:
- `id` (string): 知识ID

**请求参数**:
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "role": "editor",
  "message": "邀请您参与心脏解剖学文档的编辑工作"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "collaborator": {
      "userId": "507f1f77bcf86cd799439013",
      "name": "李医生",
      "role": "editor",
      "status": "pending",
      "invitedAt": "2024-01-15T17:30:00Z"
    }
  }
}
```

### 6.2 获取协作者列表

**接口地址**: `GET /knowledge/{id}/collaborators`

**路径参数**:
- `id` (string): 知识ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "name": "张教授",
        "role": "owner",
        "status": "active",
        "joinedAt": "2024-01-15T10:30:00Z",
        "lastActivity": "2024-01-15T16:45:00Z",
        "contributions": {
          "edits": 15,
          "reviews": 3
        }
      },
      {
        "userId": "507f1f77bcf86cd799439013",
        "name": "李医生",
        "role": "editor",
        "status": "active",
        "joinedAt": "2024-01-15T11:00:00Z",
        "lastActivity": "2024-01-15T15:20:00Z",
        "contributions": {
          "edits": 8,
          "reviews": 1
        }
      }
    ],
    "statistics": {
      "total": 2,
      "active": 2,
      "pending": 0
    }
  }
}
```

### 6.3 更新协作者权限

**接口地址**: `PUT /knowledge/{id}/collaborators/{userId}`

**路径参数**:
- `id` (string): 知识ID
- `userId` (string): 用户ID

**请求参数**:
```json
{
  "role": "reviewer"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439013",
    "oldRole": "editor",
    "newRole": "reviewer",
    "updatedAt": "2024-01-15T18:00:00Z"
  }
}
```

---

## 7. 质量管理接口

### 7.1 提交审核

**接口地址**: `POST /knowledge/{id}/review`

**路径参数**:
- `id` (string): 知识ID

**请求参数**:
```json
{
  "message": "请审核心脏解剖学文档的最新版本",
  "reviewers": [
    "507f1f77bcf86cd799439014",
    "507f1f77bcf86cd799439015"
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "reviewId": "507f1f77bcf86cd799439030",
    "status": "pending",
    "submittedAt": "2024-01-15T18:30:00Z",
    "reviewers": [
      {
        "userId": "507f1f77bcf86cd799439014",
        "name": "王教授",
        "status": "pending"
      }
    ]
  }
}
```

### 7.2 提交评审

**接口地址**: `POST /knowledge/{id}/review/{reviewId}/submit`

**路径参数**:
- `id` (string): 知识ID
- `reviewId` (string): 评审ID

**请求参数**:
```json
{
  "score": 4.5,
  "comment": "内容详实，结构清晰，建议在心脏瓣膜部分增加更多细节",
  "suggestions": [
    {
      "type": "addition",
      "location": "第3章",
      "content": "建议增加心脏瓣膜的详细描述"
    },
    {
      "type": "correction",
      "location": "第2章第3段",
      "content": "心房的描述有误，应为..."
    }
  ],
  "decision": "approved_with_changes"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "reviewId": "507f1f77bcf86cd799439030",
    "reviewerId": "507f1f77bcf86cd799439014",
    "score": 4.5,
    "decision": "approved_with_changes",
    "submittedAt": "2024-01-15T19:00:00Z"
  }
}
```

---

## 8. 统计分析接口

### 8.1 获取知识统计

**接口地址**: `GET /knowledge/{id}/statistics`

**路径参数**:
- `id` (string): 知识ID

**查询参数**:
- `period` (string): 统计周期：day/week/month/year，默认month
- `startDate` (string): 开始日期，格式：YYYY-MM-DD
- `endDate` (string): 结束日期，格式：YYYY-MM-DD

**响应示例**:
```json
{
  "success": true,
  "data": {
    "knowledgeId": "507f1f77bcf86cd799439011",
    "period": "month",
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "overview": {
      "totalViews": 1250,
      "uniqueViews": 890,
      "totalLikes": 89,
      "totalShares": 23,
      "totalComments": 15,
      "totalDownloads": 156,
      "averageRating": 4.5,
      "engagementRate": 0.12
    },
    "trends": {
      "views": [
        { "date": "2024-01-01", "count": 45 },
        { "date": "2024-01-02", "count": 52 },
        { "date": "2024-01-03", "count": 38 }
      ],
      "likes": [
        { "date": "2024-01-01", "count": 3 },
        { "date": "2024-01-02", "count": 5 },
        { "date": "2024-01-03", "count": 2 }
      ]
    },
    "demographics": {
      "byRole": [
        { "role": "student", "count": 567, "percentage": 64.2 },
        { "role": "teacher", "count": 234, "percentage": 26.5 },
        { "role": "researcher", "count": 89, "percentage": 9.3 }
      ],
      "byInstitution": [
        { "institution": "北京大学", "count": 234 },
        { "institution": "清华大学", "count": 156 }
      ]
    },
    "performance": {
      "averageReadTime": 420,
      "bounceRate": 0.15,
      "completionRate": 0.78,
      "searchRanking": 3
    }
  }
}
```

### 8.2 获取全局统计

**接口地址**: `GET /statistics/overview`

**查询参数**:
- `period` (string): 统计周期：day/week/month/year，默认month

**响应示例**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "overview": {
      "totalKnowledge": 2345,
      "publishedKnowledge": 1890,
      "totalViews": 156789,
      "totalUsers": 5678,
      "activeUsers": 2345,
      "totalCategories": 156,
      "averageQuality": 4.2
    },
    "growth": {
      "knowledgeGrowth": 0.15,
      "userGrowth": 0.08,
      "viewGrowth": 0.23
    },
    "topCategories": [
      {
        "category": "基础医学",
        "knowledgeCount": 456,
        "viewCount": 23456
      }
    ],
    "topAuthors": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "name": "张教授",
        "knowledgeCount": 45,
        "totalViews": 12345
      }
    ]
  }
}
```

---

## 9. 错误码说明

### 9.1 通用错误码

| 错误码 | HTTP状态码 | 描述 | 解决方案 |
|--------|------------|------|----------|
| INVALID_REQUEST | 400 | 请求参数无效 | 检查请求参数格式和必填字段 |
| UNAUTHORIZED | 401 | 未授权访问 | 提供有效的访问令牌 |
| FORBIDDEN | 403 | 权限不足 | 联系管理员获取相应权限 |
| NOT_FOUND | 404 | 资源不存在 | 检查资源ID是否正确 |
| CONFLICT | 409 | 资源冲突 | 检查资源状态或重试操作 |
| RATE_LIMITED | 429 | 请求频率超限 | 降低请求频率或稍后重试 |
| INTERNAL_ERROR | 500 | 服务器内部错误 | 联系技术支持 |

### 9.2 业务错误码

| 错误码 | HTTP状态码 | 描述 | 解决方案 |
|--------|------------|------|----------|
| KNOWLEDGE_NOT_FOUND | 404 | 知识不存在 | 检查知识ID |
| KNOWLEDGE_ACCESS_DENIED | 403 | 无权访问知识 | 检查访问权限 |
| KNOWLEDGE_EDIT_CONFLICT | 409 | 编辑冲突 | 刷新页面重新编辑 |
| CATEGORY_NOT_FOUND | 404 | 分类不存在 | 检查分类ID |
| VERSION_NOT_FOUND | 404 | 版本不存在 | 检查版本号 |
| COLLABORATOR_EXISTS | 409 | 协作者已存在 | 检查协作者列表 |
| REVIEW_NOT_FOUND | 404 | 评审不存在 | 检查评审ID |
| SEARCH_QUERY_INVALID | 400 | 搜索查询无效 | 检查搜索语法 |

### 9.3 验证错误码

| 错误码 | HTTP状态码 | 描述 | 解决方案 |
|--------|------------|------|----------|
| TITLE_REQUIRED | 400 | 标题不能为空 | 提供有效标题 |
| TITLE_TOO_LONG | 400 | 标题过长 | 缩短标题长度 |
| CONTENT_REQUIRED | 400 | 内容不能为空 | 提供有效内容 |
| CONTENT_TOO_LARGE | 400 | 内容过大 | 减少内容大小 |
| CATEGORY_REQUIRED | 400 | 分类不能为空 | 选择有效分类 |
| INVALID_DIFFICULTY | 400 | 难度级别无效 | 使用有效难度值 |
| INVALID_FILE_TYPE | 400 | 文件类型不支持 | 使用支持的文件类型 |
| FILE_TOO_LARGE | 400 | 文件过大 | 减小文件大小 |

---

## 10. 限流策略

### 10.1 接口限流

| 接口类型 | 限制 | 时间窗口 | 说明 |
|----------|------|----------|------|
| 读取接口 | 1000次/用户 | 1小时 | 包括获取、搜索等 |
| 写入接口 | 100次/用户 | 1小时 | 包括创建、更新等 |
| 搜索接口 | 500次/用户 | 1小时 | 全文搜索和建议 |
| 上传接口 | 50次/用户 | 1小时 | 文件上传 |
| 管理接口 | 200次/用户 | 1小时 | 管理员操作 |

### 10.2 限流响应

当触发限流时，API将返回429状态码：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "请求频率超过限制",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetTime": "2024-01-15T20:00:00Z"
    }
  },
  "timestamp": "2024-01-15T19:30:00Z",
  "requestId": "req-123456789"
}
```

---

## 11. 安全说明

### 11.1 HTTPS要求
- 所有API调用必须使用HTTPS协议
- 不支持HTTP协议访问
- 建议使用TLS 1.2或更高版本

### 11.2 请求签名
对于敏感操作，可能需要请求签名：

```javascript
// 签名算法示例
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(method + url + timestamp + body)
  .digest('hex');

// 请求头
headers: {
  'X-Signature': signature,
  'X-Timestamp': timestamp
}
```

### 11.3 IP白名单
- 管理接口支持IP白名单限制
- 可在管理后台配置允许的IP地址
- 支持CIDR格式的IP段配置

### 11.4 审计日志
- 所有API调用都会记录审计日志
- 包括请求时间、用户ID、操作类型等
- 敏感操作会记录详细的操作内容

---

## 12. SDK与工具

### 12.1 官方SDK

#### JavaScript SDK
```javascript
import { SiCalKnowledgeAPI } from '@sical/knowledge-sdk';

const api = new SiCalKnowledgeAPI({
  baseURL: 'https://api.sical.edu/v1',
  accessToken: 'your-access-token'
});

// 创建知识
const knowledge = await api.knowledge.create({
  title: '心脏解剖学基础',
  content: { type: 'html', data: '<h1>心脏解剖学</h1>' },
  category: { primary: '解剖学' }
});

// 搜索知识
const results = await api.search.query('心脏解剖', {
  category: '解剖学',
  page: 1,
  size: 20
});
```

#### Python SDK
```python
from sical_knowledge import KnowledgeAPI

api = KnowledgeAPI(
    base_url='https://api.sical.edu/v1',
    access_token='your-access-token'
)

# 创建知识
knowledge = api.knowledge.create({
    'title': '心脏解剖学基础',
    'content': {'type': 'html', 'data': '<h1>心脏解剖学</h1>'},
    'category': {'primary': '解剖学'}
})

# 搜索知识
results = api.search.query('心脏解剖', {
    'category': '解剖学',
    'page': 1,
    'size': 20
})
```

### 12.2 Postman集合

提供完整的Postman API集合，包含：
- 所有接口的示例请求
- 环境变量配置
- 自动化测试脚本
- 认证配置

下载地址：`https://api.sical.edu/docs/postman-collection.json`

### 12.3 OpenAPI规范

完整的OpenAPI 3.0规范文档：
- 接口定义：`https://api.sical.edu/docs/openapi.json`
- Swagger UI：`https://api.sical.edu/docs/swagger`
- ReDoc文档：`https://api.sical.edu/docs/redoc`

---

本API文档提供了知识库管理系统的完整接口规范，包括请求格式、响应格式、错误处理、安全要求等各个方面，为前端开发和第三方集成提供了详细的技术指导。