const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ===============================
// IMAGE UPLOAD CONFIGURATION
// ===============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

// ===============================
// MySQL CONNECTION
// ===============================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Cms@12345",
    database: "cms_blog"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("CMS Blog Backend is running!");
});

// ===============================
// REGISTER
// ===============================

app.post("/register", async(req, res) => {
  const { name, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MySQL
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Registration failed"
            });
        }

        res.json({
            message: "Registration successful"
        });
    });
});
// ===============================
// LOGIN
// ===============================

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter email and password"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: {
    id: user.id,
    name: user.username,
    email: user.email
}
        });
    });
});

// ===============================
// CREATE BLOG POST
// ===============================

app.post("/posts", (req, res) => {
    const { title, content, author_id } = req.body;

    if (!title || !content || !author_id) {
        return res.status(400).json({
            message: "Title, content and author are required"
        });
    }

    const sql = `
        INSERT INTO posts (title, content, author_id)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [title, content, author_id],
        (err, result) => {
            if (err) {
                console.error("Post creation error:", err);

                return res.status(500).json({
                    message: "Failed to create blog post"
                });
            }

            res.status(201).json({
                message: "Blog post created successfully",
                postId: result.insertId
            });
        }
    );
});

// ===============================
// GET MY BLOG POSTS
// ===============================

app.get("/posts/:author_id", (req, res) => {
    const { author_id } = req.params;

    const sql = `
        SELECT id, title, content, author_id, created_at
        FROM posts
        WHERE author_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [author_id], (err, results) => {
        if (err) {
            console.error("Error fetching posts:", err);

            return res.status(500).json({
                message: "Failed to fetch blog posts"
            });
        }

        res.json(results);
    });
});

// ===============================
// GET ALL PUBLISHED BLOG POSTS
// ===============================

app.get("/public-posts", (req, res) => {
    const sql = `
        SELECT posts.id, posts.title, posts.content, posts.created_at,
               users.username AS author
        FROM posts
        JOIN users ON posts.author_id = users.id
        ORDER BY posts.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching public posts:", err);

            return res.status(500).json({
                message: "Failed to fetch public blog posts"
            });
        }

        res.json(results);
    });
});

// ===============================
// DELETE BLOG POST
// ===============================

app.delete("/posts/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM posts WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting post:", err);

            return res.status(500).json({
                message: "Failed to delete blog post"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Blog post not found"
            });
        }

        res.json({
            message: "Blog post deleted successfully"
        });
    });
});

// ===============================
// UPDATE BLOG POST
// ===============================

app.put("/posts/:id", (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and content are required"
        });
    }

    const sql = `
        UPDATE posts
        SET title = ?, content = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [title, content, id],
        (err, result) => {
            if (err) {
                console.error("Error updating post:", err);

                return res.status(500).json({
                    message: "Failed to update blog post"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Blog post not found"
                });
            }

            res.json({
                message: "Blog post updated successfully"
            });
        }
    );
});


app.post("/page-design", (req, res) => {
  const { user_id, components } = req.body;

  if (!user_id || !Array.isArray(components)) {
    return res.status(400).json({
      message: "User ID and components are required",
    });
  }

  const componentJson = JSON.stringify(components);

  // Keep one current design per user. This makes auto-save safe
  // instead of creating a new database row every few seconds.
  const findSql = `
    SELECT id
    FROM page_designs
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  db.query(findSql, [user_id], (findErr, rows) => {
    if (findErr) {
      console.error("Error finding page design:", findErr);
      return res.status(500).json({
        message: "Failed to save page design",
      });
    }

    if (rows.length > 0) {
      const updateSql = `
        UPDATE page_designs
        SET components = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [componentJson, rows[0].id],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating page design:", updateErr);
            return res.status(500).json({
              message: "Failed to save page design",
            });
          }

          return res.json({
            message: "Page design saved successfully",
            id: rows[0].id,
          });
        }
      );
    } else {
      const insertSql = `
        INSERT INTO page_designs (user_id, components)
        VALUES (?, ?)
      `;

      db.query(
        insertSql,
        [user_id, componentJson],
        (insertErr, result) => {
          if (insertErr) {
            console.error("Error inserting page design:", insertErr);
            return res.status(500).json({
              message: "Failed to save page design",
            });
          }

          return res.json({
            message: "Page design saved successfully",
            id: result.insertId,
          });
        }
      );
    }
  });
});

// ===============================
// GET SAVED PAGE DESIGN
// ===============================

app.get("/page-design/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT * FROM page_designs
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error loading page design:", err);

      return res.status(500).json({
        message: "Failed to load page design",
      });
    }

    if (results.length === 0) {
      return res.json({
        components: [],
      });
    }

    let components = results[0].components;

    // Convert JSON string into JavaScript array
    if (typeof components === "string") {
      try {
        components = JSON.parse(components);
      } catch (error) {
        console.error("Error parsing components:", error);

        components = [];
      }
    }

    res.json({
      components: components || [],
    });
  });
});

// ===============================
// IMAGE UPLOAD API
// ===============================

app.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const imageUrl =
  `http://localhost:5000/uploads/${req.file.filename}`;

    res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      message: "Failed to upload image",
    });
  }
});


// ===============================
// DASHBOARD STATISTICS
// ===============================

app.get("/dashboard-stats/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT 
      COUNT(*) AS totalPosts,
      COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) AS recentPosts
    FROM posts
    WHERE author_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching dashboard statistics:", err);

      return res.status(500).json({
        message: "Failed to fetch dashboard statistics",
      });
    }

    res.json({
      totalPosts: results[0].totalPosts || 0,
      recentPosts: results[0].recentPosts || 0,
    });
  });
});


// ===============================
// RECENT ACTIVITY
// ===============================

app.get("/recent-activity/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT 
      id,
      title,
      created_at,
      'created' AS activity_type
    FROM posts
    WHERE author_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching recent activity:", err);

      return res.status(500).json({
        message: "Failed to fetch recent activity",
      });
    }

    res.json(results);
  });
});

// ===============================
// DASHBOARD STATISTICS
// ===============================

app.get("/dashboard-stats/:user_id", (req, res) => {
  const { user_id } = req.params;

  const totalPostsSql = `
    SELECT COUNT(*) AS totalPosts
    FROM posts
    WHERE author_id = ?
  `;

  const recentPostsSql = `
    SELECT COUNT(*) AS recentPosts
    FROM posts
    WHERE author_id = ?
    AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `;

  db.query(totalPostsSql, [user_id], (err, totalResult) => {
    if (err) {
      console.error("Dashboard statistics error:", err);

      return res.status(500).json({
        message: "Failed to load dashboard statistics",
      });
    }

    db.query(recentPostsSql, [user_id], (err, recentResult) => {
      if (err) {
        console.error("Recent posts error:", err);

        return res.status(500).json({
          message: "Failed to load recent posts",
        });
      }

      res.json({
        totalPosts: totalResult[0].totalPosts,
        recentPosts: recentResult[0].recentPosts,
      });
    });
  });
});

// ===============================
// RECENT ACTIVITY
// ===============================

app.get("/recent-activity/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT
      id,
      title,
      created_at
    FROM posts
    WHERE author_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Recent activity error:", err);

      return res.status(500).json({
        message: "Failed to load recent activity",
      });
    }

    res.json(results);
  });
});

// ===============================
// DASHBOARD STATISTICS
// ===============================

app.get("/dashboard-stats/:user_id", (req, res) => {

  const { user_id } = req.params;

  const totalPostsSql = `
    SELECT COUNT(*) AS totalPosts
    FROM posts
    WHERE author_id = ?
  `;

  const recentPostsSql = `
    SELECT COUNT(*) AS recentPosts
    FROM posts
    WHERE author_id = ?
    AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `;

  db.query(
    totalPostsSql,
    [user_id],
    (err, totalResult) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message:
            "Failed to load dashboard statistics",
        });
      }

      db.query(
        recentPostsSql,
        [user_id],
        (err, recentResult) => {

          if (err) {
            console.error(err);

            return res.status(500).json({
              message:
                "Failed to load recent posts",
            });
          }

          res.json({
            totalPosts:
              totalResult[0].totalPosts,

            recentPosts:
              recentResult[0].recentPosts,
          });

        }
      );

    }
  );

});


// ===============================
// RECENT ACTIVITY
// ===============================

app.get(
  "/recent-activity/:user_id",
  (req, res) => {

    const { user_id } = req.params;

    const sql = `
      SELECT
        id,
        title,
        created_at
      FROM posts
      WHERE author_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `;

    db.query(
      sql,
      [user_id],
      (err, results) => {

        if (err) {
          console.error(
            "Recent activity error:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to load recent activity",
          });
        }

        res.json(results);

      }
    );

  }
);


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});
