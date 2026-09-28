import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  // =====================================================
  // AUTH STATES
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  // =====================================================
  // PAGE STATES
  // =====================================================

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showPublicBlog, setShowPublicBlog] = useState(false);
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [showMyWebsite, setShowMyWebsite] = useState(false);
  const [showPublishedWebsite, setShowPublishedWebsite] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [showAccount, setShowAccount] = useState(false);

  // =====================================================
  // BLOG STATES
  // =====================================================

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postMessage, setPostMessage] = useState("");

  const [posts, setPosts] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);

  const [postsMessage, setPostsMessage] = useState("");
  const [publicMessage, setPublicMessage] = useState("");

  // =====================================================
  // EDIT POST STATES
  // =====================================================

  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // =====================================================
  // PAGE BUILDER STATES
  // =====================================================

  const [pageComponents, setPageComponents] = useState([]);
  const [builderMessage, setBuilderMessage] = useState("");

  // =====================================================
  // CONTENT-TO-WEBSITE AI
  // =====================================================

  const [showContentAI, setShowContentAI] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  // =====================================================
  // DASHBOARD STATES
  // =====================================================

  const [dashboardStats, setDashboardStats] = useState({
    totalPosts: 0,
    recentPosts: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // =====================================================
  // CLOSE ALL PAGES
  // =====================================================

  const closeAllPages = () => {
    setShowCreatePost(false);
    setShowMyPosts(false);
    setShowPublicBlog(false);
    setShowPageBuilder(false);
    setShowMyWebsite(false);
    setShowPublishedWebsite(false);
    setShowAccount(false);

    setEditingPostId(null);
    setPostMessage("");
    setEditMessage("");
    setPostsMessage("");
    setPublicMessage("");
    setBuilderMessage("");
  };

  // =====================================================
  // LOAD PAGE DESIGN
  // =====================================================

  const loadPageDesign = async (userId) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_URL}/page-design/${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        if (data.components) {
          setPageComponents(data.components);
        } else {
          setPageComponents([]);
        }
      }
    } catch (error) {
      console.error("Error loading page design:", error);
    }
  };

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const loadDashboardData = async (userId) => {
    if (!userId) return;

    setStatsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/posts/${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        const userPosts = Array.isArray(data)
          ? data
          : data.posts || [];

        setDashboardStats({
          totalPosts: userPosts.length,
          recentPosts: userPosts.slice(0, 5).length,
        });

        setRecentActivity(userPosts.slice(0, 5));
      }
    } catch (error) {
      console.error(
        "Error loading dashboard:",
        error
      );
    }

    setStatsLoading(false);
  };

  // =====================================================
  // AUTO LOAD USER DATA
  // =====================================================

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadPageDesign(user.id);
      loadDashboardData(user.id);
    }
  }, [isLoggedIn, user]);

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("Creating your account...");

    try {
      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message ||
            "Registration successful! Please sign in."
        );

        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          setIsRegister(false);
          setMessage("");
        }, 1500);
      } else {
        setMessage(
          data.message ||
            "Registration failed."
        );
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("Signing you in...");

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);

        setIsLoggedIn(true);

        setShowAuthPage(false);

        setEmail("");
        setPassword("");
        setMessage("");

        closeAllPages();
      } else {
        setMessage(
          data.message ||
            "Invalid email or password."
        );
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);

    setPosts([]);
    setPublicPosts([]);
    setPageComponents([]);

    setDashboardStats({
      totalPosts: 0,
      recentPosts: 0,
    });

    setRecentActivity([]);

    closeAllPages();
  };

  // =====================================================
  // CREATE BLOG POST
  // =====================================================

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!user?.id) return;

    setPostMessage("Publishing post...");

    try {
      const response = await fetch(
        `${API_URL}/posts`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: postTitle,
            content: postContent,
            author_id: user.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPostMessage(
          data.message ||
            "Post published successfully!"
        );

        setPostTitle("");
        setPostContent("");

        loadDashboardData(user.id);

        setTimeout(() => {
          setShowCreatePost(false);
          setPostMessage("");
        }, 1500);
      } else {
        setPostMessage(
          data.message ||
            "Failed to create post."
        );
      }
    } catch (error) {
      setPostMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // LOAD MY POSTS
  // =====================================================

  const handleMyPosts = async () => {
    if (!user?.id) return;

    closeAllPages();

    setShowMyPosts(true);
    setPostsMessage("Loading your posts...");

    try {
      const response = await fetch(
        `${API_URL}/posts/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        const userPosts = Array.isArray(data)
          ? data
          : data.posts || [];

        setPosts(userPosts);
        setPostsMessage("");
      } else {
        setPostsMessage(
          data.message ||
            "Failed to load posts."
        );
      }
    } catch (error) {
      setPostsMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // DELETE POST
  // =====================================================

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts(
          posts.filter(
            (post) => post.id !== postId
          )
        );

        loadDashboardData(user.id);
      } else {
        alert(
          data.message ||
            "Failed to delete post."
        );
      }
    } catch (error) {
      alert("Cannot connect to the server.");
    }
  };

  // =====================================================
  // START EDITING
  // =====================================================

  const startEditingPost = (post) => {
    setEditingPostId(post.id);

    setEditTitle(post.title);
    setEditContent(post.content);

    setEditMessage("");
  };

  // =====================================================
  // UPDATE POST
  // =====================================================

  const handleUpdatePost = async (postId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      setEditMessage(
        "Title and content are required."
      );

      return;
    }

    setEditMessage("Updating post...");

    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: editTitle,
            content: editContent,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  title: editTitle,
                  content: editContent,
                }
              : post
          )
        );

        setEditMessage(
          "Post updated successfully!"
        );

        loadDashboardData(user.id);

        setTimeout(() => {
          setEditingPostId(null);
          setEditMessage("");
        }, 1000);
      } else {
        setEditMessage(
          data.message ||
            "Failed to update post."
        );
      }
    } catch (error) {
      setEditMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // PUBLIC BLOG
  // =====================================================

  const handlePublicBlog = async () => {
    closeAllPages();

    setShowPublicBlog(true);

    setPublicMessage("Loading blog posts...");

    try {
      const response = await fetch(
        `${API_URL}/public-posts`
      );

      const data = await response.json();

      if (response.ok) {
        const allPosts = Array.isArray(data)
          ? data
          : data.posts || [];

        setPublicPosts(allPosts);

        setPublicMessage("");
      } else {
        setPublicMessage(
          data.message ||
            "Failed to load public blog."
        );
      }
    } catch (error) {
      setPublicMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // VIEW MY WEBSITE
  // =====================================================

  const handleViewMyWebsite = () => {
    closeAllPages();

    setShowMyWebsite(true);
  };

  // =====================================================
  // PUBLISH WEBSITE
  // =====================================================

  const handlePublishWebsite = async () => {
    if (!user?.id || pageComponents.length === 0) return;

    setBuilderMessage("Publishing your website...");

    try {
      const response = await fetch(`${API_URL}/page-design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          components: pageComponents,
        }),
      });

      if (!response.ok) {
        throw new Error("Publish failed");
      }

      const url = `${window.location.origin}/webora/site/${user.id}`;
      setPublishedUrl(url);
      closeAllPages();
      setShowPublishedWebsite(true);
    } catch (error) {
      setBuilderMessage("Could not publish website. Please make sure the server is running.");
    }
  };

  // =====================================================
  // DRAG START
  // =====================================================

  const handleDragStart = (
    e,
    componentType
  ) => {
    e.dataTransfer.setData(
      "componentType",
      componentType
    );
  };

  // =====================================================
  // DRAG OVER
  // =====================================================

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // =====================================================
  // DROP COMPONENT
  // =====================================================

  const handleDrop = (e) => {
    e.preventDefault();

    const componentType =
      e.dataTransfer.getData(
        "componentType"
      );

    if (!componentType) return;

    let newComponent;

    switch (componentType) {
      case "heading":
        newComponent = {
          id: Date.now(),
          type: "heading",
          content: "Your Heading",
        };
        break;

      case "text":
        newComponent = {
          id: Date.now(),
          type: "text",
          content:
            "Write something amazing here...",
        };
        break;

      case "image":
        newComponent = {
          id: Date.now(),
          type: "image",
          content:
            "https://via.placeholder.com/600x300",
        };
        break;

      case "button":
        newComponent = {
          id: Date.now(),
          type: "button",
          content: "Click Me",
          link: "",
        };
        break;

      default:
        return;
    }

    setPageComponents([
      ...pageComponents,
      newComponent,
    ]);
  };

  // =====================================================
  // UPDATE PAGE COMPONENT
  // =====================================================

  const updateComponent = (
    componentId,
    value
  ) => {
    setPageComponents(
      pageComponents.map((component) =>
        component.id === componentId
          ? {
              ...component,
              content: value,
            }
          : component
      )
    );
  };

  // =====================================================
  // DELETE PAGE COMPONENT
  // =====================================================

  const deleteComponent = (componentId) => {
    setPageComponents(
      pageComponents.filter(
        (component) =>
          component.id !== componentId
      )
    );
  };

  // =====================================================
  // SAVE PAGE DESIGN
  // =====================================================

  const handleSaveDesign = async () => {
    if (!user?.id) return;

    setBuilderMessage("Saving website design...");

    try {
      const response = await fetch(
        `${API_URL}/page-design`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,
            components: pageComponents,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBuilderMessage(
          data.message ||
            "Website design saved successfully!"
        );
      } else {
        setBuilderMessage(
          data.message ||
            "Failed to save design."
        );
      }
    } catch (error) {
      setBuilderMessage(
        "Cannot connect to the server."
      );
    }
  };

  // =====================================================
  // CONTENT-TO-WEBSITE AI
  // Turns pasted content into a ready-to-edit website layout.
  // This runs locally, so no API key is required.
  // =====================================================

  const generateWebsiteFromContent = (append = false) => {
    const raw = aiContent.trim();

    if (!raw) {
      setAiMessage("Paste some content first.");
      return;
    }

    setAiGenerating(true);
    setAiMessage("AI is analyzing your content and creating a layout...");

    window.setTimeout(() => {
      const lines = raw
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

      const urlMatches = raw.match(/https?:\/\/[^\s)]+/gi) || [];
      const firstLine = lines[0] || "Your New Website";
      const title = firstLine.length > 70
        ? `${firstLine.slice(0, 67)}...`
        : firstLine;

      const cleanParagraphs = lines
        .filter((line, index) => index > 0 || lines.length === 1)
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter((line) => line.length > 15);

      const bullets = lines
        .filter((line) => /^[-*•]\s+/.test(line))
        .map((line) => line.replace(/^[-*•]\s+/, ""));

      const generated = [
        {
          id: Date.now(),
          type: "heading",
          content: title,
        },
      ];

      if (cleanParagraphs.length) {
        generated.push({
          id: Date.now() + 1,
          type: "text",
          content: cleanParagraphs.slice(0, 2).join(" "),
        });
      }

      if (bullets.length) {
        generated.push({
          id: Date.now() + 2,
          type: "text",
          content: `✦ ${bullets.join("  •  ")}`,
        });
      }

      if (cleanParagraphs.length > 2) {
        generated.push({
          id: Date.now() + 3,
          type: "text",
          content: cleanParagraphs.slice(2).join(" "),
        });
      }

      if (urlMatches.length) {
        generated.push({
          id: Date.now() + 4,
          type: "button",
          content: "Explore More",
          link: urlMatches[0].replace(/[.,!?]+$/, ""),
        });
      } else {
        generated.push({
          id: Date.now() + 4,
          type: "button",
          content: "Learn More",
          link: "",
        });
      }

      setPageComponents((current) =>
        append ? [...current, ...generated] : generated
      );

      // AI creates the first layout, then hands control back to the
      // drag-and-drop builder so the user can edit before previewing.
      if (!append) {
        setShowContentAI(false);
        setShowPageBuilder(true);
        setBuilderMessage("✨ AI layout created. Now drag, drop and edit your website.");
      }

      setAiMessage(
        `Generated ${generated.length} website components from your content.`
      );
      setAiGenerating(false);
    }, 500);
  };

  // =====================================================
  // RENDER WEBSITE COMPONENT
  // =====================================================

  const renderWebsiteComponent = (
    component,
    editable = false
  ) => {
    if (editable) {
      return (
        <div
          key={component.id}
          className="builder-component-item"
        >
          <div className="builder-component-controls">
            <strong>
              {component.type.toUpperCase()}
            </strong>

            <button
              onClick={() =>
                deleteComponent(component.id)
              }
            >
              🗑️
            </button>
          </div>

          {component.type === "image" ? (
            <input
              type="text"
              value={component.content}
              onChange={(e) =>
                updateComponent(
                  component.id,
                  e.target.value
                )
              }
              placeholder="Image URL"
            />
          ) : (
            <input
              type="text"
              value={component.content}
              onChange={(e) =>
                updateComponent(
                  component.id,
                  e.target.value
                )
              }
            />
          )}

          {component.type === "button" && (
            <input
              type="url"
              value={component.link || ""}
              onChange={(e) =>
                setPageComponents((current) =>
                  current.map((item) =>
                    item.id === component.id
                      ? { ...item, link: e.target.value }
                      : item
                  )
                )
              }
              placeholder="Button link (https://...)"
            />
          )}

          <div className="builder-component-preview">
            {renderWebsiteComponent(
              component,
              false
            )}
          </div>
        </div>
      );
    }

    switch (component.type) {
      case "heading":
        return (
          <h1
            key={component.id}
            className="website-heading"
          >
            {component.content}
          </h1>
        );

      case "text":
        return (
          <p
            key={component.id}
            className="website-text"
          >
            {component.content}
          </p>
        );

      case "image":
        return (
          <img
            key={component.id}
            src={component.content}
            alt="Website content"
            className="website-image"
            onError={(e) => {
              e.currentTarget.style.display =
                "none";
            }}
          />
        );

      case "button":
        return (
          <button
            key={component.id}
            className="website-button"
            onClick={() => {
              if (component.link) {
                window.open(component.link, "_blank", "noopener,noreferrer");
              }
            }}
          >
            {component.content}
          </button>
        );

      default:
        return null;
    }
  };

  // =====================================================
  // CREATE POST PAGE
  // =====================================================

  if (isLoggedIn && showCreatePost) {
    return (
      <div className="app-page">
        <header className="page-navbar">
          <button
            className="back-dashboard-btn"
            onClick={() => {
              closeAllPages();
            }}
          >
            ← Dashboard
          </button>

          <div className="page-navbar-brand">
            <span>✍️</span>
            <h2>Create Blog Post</h2>
          </div>
        </header>

        <main className="content-page-container">
          <div className="content-page-header">
            <span className="section-tag">
              CREATE CONTENT
            </span>

            <h1>
              Write Something Amazing
            </h1>

            <p>
              Share your ideas with the world.
            </p>
          </div>

          <form
            className="create-post-form"
            onSubmit={handleCreatePost}
          >
            <div className="form-group">
              <label>Post Title</label>

              <input
                type="text"
                placeholder="Enter your blog title..."
                value={postTitle}
                onChange={(e) =>
                  setPostTitle(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Post Content</label>

              <textarea
                placeholder="Start writing your story..."
                value={postContent}
                onChange={(e) =>
                  setPostContent(e.target.value)
                }
                rows="14"
                required
              />
            </div>

            <button
              type="submit"
              className="publish-post-btn"
            >
              🚀 Publish Post
            </button>

            {postMessage && (
              <div className="page-message">
                {postMessage}
              </div>
            )}
          </form>
        </main>
      </div>
    );
  }

  // =====================================================
  // MY POSTS PAGE
  // =====================================================

  if (isLoggedIn && showMyPosts) {
    return (
      <div className="app-page">
        <header className="page-navbar">
          <button
            className="back-dashboard-btn"
            onClick={closeAllPages}
          >
            ← Dashboard
          </button>

          <div className="page-navbar-brand">
            <span>📚</span>
            <h2>My Blog Posts</h2>
          </div>

          <button
            className="small-primary-btn"
            onClick={() => {
              closeAllPages();
              setShowCreatePost(true);
            }}
          >
            + New Post
          </button>
        </header>

        <main className="content-page-container">
          <div className="content-page-header">
            <span className="section-tag">
              YOUR CONTENT
            </span>

            <h1>Manage Your Blog Posts</h1>

            <p>
              Edit, update or delete your posts.
            </p>
          </div>

          {postsMessage && (
            <div className="page-message">
              {postsMessage}
            </div>
          )}

          <div className="posts-grid">
            {posts.length === 0 &&
            !postsMessage ? (
              <div className="empty-state">
                <div>📭</div>

                <h2>No Posts Yet</h2>

                <p>
                  Start creating your first blog
                  post.
                </p>

                <button
                  onClick={() => {
                    closeAllPages();
                    setShowCreatePost(true);
                  }}
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  className="blog-post-card"
                  key={post.id}
                >
                  {editingPostId === post.id ? (
                    <div className="edit-post-form">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) =>
                          setEditTitle(
                            e.target.value
                          )
                        }
                      />

                      <textarea
                        value={editContent}
                        onChange={(e) =>
                          setEditContent(
                            e.target.value
                          )
                        }
                        rows="8"
                      />

                      {editMessage && (
                        <p className="page-message">
                          {editMessage}
                        </p>
                      )}

                      <div className="post-actions">
                        <button
                          className="save-post-btn"
                          onClick={() =>
                            handleUpdatePost(
                              post.id
                            )
                          }
                        >
                          💾 Save
                        </button>

                        <button
                          className="cancel-post-btn"
                          onClick={() => {
                            setEditingPostId(
                              null
                            );
                            setEditMessage("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="post-date">
                        {post.created_at
                          ? new Date(
                              post.created_at
                            ).toLocaleDateString()
                          : "Today"}
                      </span>

                      <h2>{post.title}</h2>

                      <p>{post.content}</p>

                      <div className="post-actions">
                        <button
                          className="edit-post-btn"
                          onClick={() =>
                            startEditingPost(post)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-post-btn"
                          onClick={() =>
                            handleDeletePost(
                              post.id
                            )
                          }
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );



  }

  // =====================================================
  // PUBLIC BLOG PAGE
  // =====================================================

  if (isLoggedIn && showPublicBlog) {
    return (
      <div className="public-blog-page">
        <header className="page-navbar">
          <button
            className="back-dashboard-btn"
            onClick={closeAllPages}
          >
            ← Dashboard
          </button>

          <div className="page-navbar-brand">
            <span>🌍</span>
            <h2>Public Blog</h2>
          </div>
        </header>

        <main className="public-blog-container">
          <div className="public-blog-hero">
            <span>✨ STORIES & IDEAS</span>

            <h1>
              Discover Amazing Stories
            </h1>

            <p>
              Explore content created by our
              community.
            </p>
          </div>

          {publicMessage && (
            <div className="page-message">
              {publicMessage}
            </div>
          )}

          <div className="public-posts-grid">
            {publicPosts.map((post) => (
              <article
                className="public-post-card"
                key={post.id}
              >
                <span className="post-date">
                  {post.created_at
                    ? new Date(
                        post.created_at
                      ).toLocaleDateString()
                    : "Today"}
                </span>

                <h2>{post.title}</h2>

                <p>{post.content}</p>

                <div className="post-author">
                  👤{" "}
                  {post.author_name ||
                    "CMS Creator"}
                </div>
              </article>
            ))}
          </div>

          {publicPosts.length === 0 &&
            !publicMessage && (
              <div className="empty-state">
                <div>📭</div>

                <h2>No Public Posts Yet</h2>

                <p>
                  Check back later for new
                  stories.
                </p>
              </div>
            )}
        </main>
      </div>
    );
  }


  // ==========================================
// WEBORA UNIQUE FEATURE
// LIVE DESIGN-TO-WEBSITE PREVIEW
// ==========================================

const renderLiveWebsite = () => {
  return (
    <div className="live-website-preview">
      <div className="live-preview-browser">

        {/* Browser Header */}
        <div className="browser-header">
          <div className="browser-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="browser-address">
            🔒 webora.local
          </div>

          <div className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </div>
        </div>

        {/* Website */}
        <div className="live-website-page">

          {pageComponents.length === 0 ? (
            <div className="empty-live-preview">
              <div className="empty-preview-icon">
                ✨
              </div>

              <h2>Your Website Starts Here</h2>

              <p>
                Drag components from the builder
                to create your website.
              </p>
            </div>
          ) : (
            pageComponents.map((component) => (
              <div
                key={component.id}
                className="live-component"
              >
                {renderWebsiteComponent(
                  component,
                  false
                )}
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
};

  // =====================================================
  // CONTENT-TO-WEBSITE AI MODAL
  // =====================================================

  const contentAIModal = showContentAI ? (
    <div className="content-ai-overlay">
      <div className="content-ai-modal">
        <button
          className="content-ai-close"
          onClick={() => setShowContentAI(false)}
        >
          ×
        </button>

        <div className="content-ai-badge">✨ WEBORA AI</div>
        <h1>Content-to-Website AI</h1>
        <p>
          Paste your content and Webora will turn it into an editable website layout automatically.
        </p>

        <textarea
          className="content-ai-textarea"
          value={aiContent}
          onChange={(e) => setAiContent(e.target.value)}
          placeholder={`Paste your content here...\n\nExample:\nMy Photography Portfolio\nI capture weddings, portraits and travel stories.\n- Wedding Photography\n- Portrait Sessions\n- Travel Stories\nhttps://example.com`}
        />

        {aiMessage && (
          <div className="content-ai-message">{aiMessage}</div>
        )}

        <div className="content-ai-actions">
          <button
            className="content-ai-secondary"
            onClick={() => {
              setAiContent("");
              setAiMessage("");
            }}
          >
            Clear
          </button>
          <button
            className="content-ai-secondary"
            onClick={() => generateWebsiteFromContent(true)}
            disabled={aiGenerating}
          >
            {aiGenerating ? "Generating..." : "＋ Add to Canvas"}
          </button>
          <button
            className="content-ai-primary"
            onClick={() => generateWebsiteFromContent(false)}
            disabled={aiGenerating}
          >
            {aiGenerating ? "✨ Creating..." : "✨ Generate & View Website"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // =====================================================
  // PAGE BUILDER
  // =====================================================

  if (isLoggedIn && showPageBuilder) {
    return (
      <div className="page-builder-page">
        {contentAIModal}
        <header className="builder-navbar">
          <button
            className="back-dashboard-btn"
            onClick={closeAllPages}
          >
            ← Dashboard
          </button>

          <div className="builder-navbar-title">
            🏗️ Website Builder
          </div>

          <div className="builder-navbar-actions">
            <button
              onClick={handleViewMyWebsite}
              className="builder-preview-btn"
            >
              👁️ Preview
            </button>

            <button
              onClick={handlePublishWebsite}
              className="builder-publish-btn"
              disabled={pageComponents.length === 0}
            >
              🚀 Publish
            </button>

            <button
              onClick={handleSaveDesign}
              className="builder-save-btn"
            >
              💾 Save Design
            </button>
          </div>
        </header>

        <div className="webora-workflow-bar">
          <div className="workflow-step active"><span>1</span><b>Idea</b></div>
          <div className="workflow-line"></div>
          <div className="workflow-step active"><span>2</span><b>AI Layout</b></div>
          <div className="workflow-line"></div>
          <div className="workflow-step active"><span>3</span><b>Drag & Drop</b></div>
          <div className="workflow-line"></div>
          <div className="workflow-step"><span>4</span><b>Preview</b></div>
          <div className="workflow-line"></div>
          <div className="workflow-step"><span>5</span><b>Publish</b></div>
        </div>

        <div className="builder-layout">
          {/* COMPONENT SIDEBAR */}

          <aside className="builder-sidebar">
            <div className="builder-sidebar-header">
              <span>COMPONENTS</span>

              <h2>
                Build Your Website
              </h2>

              <p>
                Drag components into the
                canvas.
              </p>
            </div>

            <div className="component-list">
              <div
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    "heading"
                  )
                }
                className="component-tool"
              >
                <span>🔤</span>

                <div>
                  <strong>Heading</strong>

                  <small>
                    Add a title
                  </small>
                </div>
              </div>

              <div
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    "text"
                  )
                }
                className="component-tool"
              >
                <span>📝</span>

                <div>
                  <strong>Text</strong>

                  <small>
                    Add content
                  </small>
                </div>
              </div>

              <div
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    "image"
                  )
                }
                className="component-tool"
              >
                <span>🖼️</span>

                <div>
                  <strong>Image</strong>

                  <small>
                    Add an image
                  </small>
                </div>
              </div>

              <div
                draggable
                onDragStart={(e) =>
                  handleDragStart(
                    e,
                    "button"
                  )
                }
                className="component-tool"
              >
                <span>🔘</span>

                <div>
                  <strong>Button</strong>

                  <small>
                    Add a button
                  </small>
                </div>
              </div>
            </div>

            <button
              className="content-ai-tool"
              onClick={() => {
                setShowContentAI(true);
                setAiMessage("");
              }}
            >
              <span>✨</span>
              <div>
                <strong>Content-to-Website AI</strong>
                <small>Paste content → get a website</small>
              </div>
            </button>

            {builderMessage && (
              <div className="builder-message">
                {builderMessage}
              </div>
            )}
          </aside>

          {/* BUILDER + LIVE PREVIEW WORKSPACE */}

          <div className="webora-builder-workspace">

            <main
              className="builder-canvas"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
            <div className="builder-canvas-header">
              <span>WEBSITE CANVAS</span>

              <h1>
                Design Your Website
              </h1>
            </div>

            {pageComponents.length === 0 ? (
              <div className="builder-empty">
                <div>🎨</div>

                <h2>
                  Start Building
                </h2>

                <p>
                  Drag components from the
                  sidebar and drop them here.
                </p>
              </div>
            ) : (
              <div className="builder-components">
                {pageComponents.map(
                  (component) =>
                    renderWebsiteComponent(
                      component,
                      true
                    )
                )}
              </div>
            )}


            </main>

            <div className="builder-live-area">
              <div className="live-preview-section">
                <div className="live-preview-heading">
                  <div>
                    <span className="live-preview-badge">⚡ LIVE</span>
                    <h2>Your Website</h2>
                    <p>Changes appear here instantly.</p>
                  </div>
                  <div className="live-status">
                    <span></span>
                    Live Sync
                  </div>
                </div>
                {renderLiveWebsite()}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MY WEBSITE PREVIEW
  // =====================================================

  if (isLoggedIn && showMyWebsite) {
    return (
      <div className="website-preview-page">
        <header className="page-navbar">
          <button
            className="back-dashboard-btn"
            onClick={() => {
              closeAllPages();
              setShowPageBuilder(true);
            }}
          >
            ← Page Builder
          </button>

          <div className="page-navbar-actions">
            <button
              className="builder-preview-btn"
              onClick={() => {
                closeAllPages();
                setShowPageBuilder(true);
              }}
            >
              ✏️ Edit Website
            </button>
            <button
              className="builder-publish-btn"
              onClick={handlePublishWebsite}
            >
              🚀 Publish
            </button>
          </div>

          <div className="page-navbar-brand">
            <span>🌐</span>

            <div>
              <h2>AI Generated Website</h2>
              <small className="ai-preview-subtitle">
                Your website is ready to view
              </small>
            </div>
          </div>
        </header>

        <main className="website-preview-container">
          {pageComponents.length === 0 ? (
            <div className="empty-state">
              <div>🏗️</div>

              <h2>
                Your Website Is Empty
              </h2>

              <p>
                Use the Page Builder to add
                content.
              </p>

              <button
                onClick={() => {
                  closeAllPages();
                  setShowPageBuilder(true);
                }}
              >
                Open Page Builder
              </button>
            </div>
          ) : (
            <div className="website-live-preview">
              {pageComponents.map(
                (component) =>
                  renderWebsiteComponent(
                    component
                  )
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // =====================================================
  // PUBLISHED WEBSITE
  // =====================================================

  if (isLoggedIn && showPublishedWebsite) {
    return (
      <div className="published-website-page">
        <header className="published-navbar">
          <div>
            <span className="published-badge">● LIVE</span>
            <strong>Your website is published</strong>
          </div>
          <div className="published-actions">
            <button onClick={() => navigator.clipboard?.writeText(publishedUrl)}>📋 Copy Link</button>
            <button onClick={() => { closeAllPages(); setShowPageBuilder(true); }}>✏️ Edit</button>
          </div>
        </header>

        <div className="published-link-bar">
          <span>🔒</span>
          <input value={publishedUrl} readOnly />
          <button onClick={() => navigator.clipboard?.writeText(publishedUrl)}>Copy</button>
        </div>

        <main className="published-site-frame">
          <div className="published-site-content">
            {pageComponents.map((component) => (
              <div key={component.id} className="published-component">
                {renderWebsiteComponent(component, false)}
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ACCOUNT PAGE
  // =====================================================

  if (isLoggedIn && showAccount) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="account-header">
            <div className="account-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <span className="account-label">WEBORA ACCOUNT</span>
              <h1>My Account</h1>
              <p>Manage and view your Webora account details.</p>
            </div>
          </div>

          <div className="account-details-grid">
            <div className="account-detail-card"><div className="account-detail-icon">👤</div><div><span>Full Name</span><strong>{user?.name || "Not available"}</strong></div></div>
            <div className="account-detail-card"><div className="account-detail-icon">📧</div><div><span>Email Address</span><strong>{user?.email || "Not available"}</strong></div></div>
            <div className="account-detail-card"><div className="account-detail-icon">🆔</div><div><span>User ID</span><strong>{user?.id || "Not available"}</strong></div></div>
            <div className="account-detail-card"><div className="account-detail-icon">📝</div><div><span>Published Posts</span><strong>{posts?.length || 0}</strong></div></div>
          </div>

          <div className="account-status-card">
            <div><span className="account-status-dot"></span><div><strong>Account Active</strong><p>Your Webora account is ready to create, design and publish.</p></div></div>
          </div>

          <div className="account-actions">
            <button className="account-back-btn" onClick={() => { closeAllPages(); }}>← Back to Dashboard</button>
            <button className="account-logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>
    );
  }


  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  if (isLoggedIn) {
    return (
      <div className="app-dashboard">

        <div className="dashboard-glow glow-one"></div>
<div className="dashboard-glow glow-two"></div>
<div className="dashboard-glow glow-three"></div>

        {/* NAVBAR */}

        <header className="dashboard-navbar">

          <div className="dashboard-brand">

            <div className="dashboard-brand-icon">
              <span className="webora-logo-letter">W</span>
            </div>
            <div>
              <h2>Webora</h2>

              <span>
                Content Management System
              </span>
            </div>

          </div>

          <div className="dashboard-user-section">

            <button
              type="button"
              className="dashboard-user-info dashboard-profile-button"
              onClick={() => {
                closeAllPages();
                setShowAccount(true);
              }}
              title="Open My Account"
            >

              <div className="dashboard-avatar">
                {(user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="dashboard-user-details">

                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                  {user?.email}
                </span>

              </div>

            </button>

            <button
              className="navbar-logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        </header>

        <main className="dashboard-main-container">

          {/* HERO */}

          <section className="dashboard-hero">

            <div className="dashboard-hero-content">

              <span className="dashboard-badge">
                ✨ YOUR CONTENT SPACE
              </span>

              <h1>
                Welcome back,
                <span>
                  {" "}
                  {user?.name || "Creator"}
                </span>
                👋
              </h1>

              <p>
                Manage your blog posts, design
                your website and grow your
                content — all from one powerful
                dashboard.
              </p>

              <div className="dashboard-hero-actions">

                <button
                  className="hero-primary-btn"
                  onClick={() => {
                    closeAllPages();
                    setShowCreatePost(true);
                  }}
                >
                  ✍️ Create New Post
                </button>

                <button
                  className="hero-secondary-btn"
                  onClick={() =>
                    loadDashboardData(user?.id)
                  }
                >
                  🔄 Refresh
                </button>

              </div>

            </div>

            <div className="dashboard-hero-visual">

              <div className="hero-visual-card">

                <div className="hero-chart">

                  <div className="chart-bar bar-one"></div>

                  <div className="chart-bar bar-two"></div>

                  <div className="chart-bar bar-three"></div>

                  <div className="chart-bar bar-four"></div>

                  <div className="chart-bar bar-five"></div>

                </div>

                <p>
                  Content Activity
                </p>

              </div>

            </div>

          </section>

          {/* OVERVIEW */}

          <section className="dashboard-section">

            <div className="dashboard-section-title">

              <div>

                <span className="section-tag">
                  OVERVIEW
                </span>

                <h2>
                  Dashboard Overview
                </h2>

                <p>
                  Track your content and website
                  activity.
                </p>

              </div>

            </div>

            {statsLoading ? (

              <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <p>
                  Loading your dashboard...
                </p>

              </div>

            ) : (

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon">
                    📝
                  </div>

                  <div className="stat-number">
                    {dashboardStats.totalPosts}
                  </div>

                  <h3>
                    Total Posts
                  </h3>

                  <p>
                    Blog posts you've created
                  </p>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    🚀
                  </div>

                  <div className="stat-number">
                    {dashboardStats.recentPosts}
                  </div>

                  <h3>
                    Recent Posts
                  </h3>

                  <p>
                    Your latest blog content
                  </p>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    🌐
                  </div>

                  <div className="stat-number">
                    {pageComponents.length}
                  </div>

                  <h3>
                    Website Components
                  </h3>

                  <p>
                    Components in your website
                  </p>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    🔔
                  </div>

                  <div className="stat-number">
                    {recentActivity.length}
                  </div>

                  <h3>
                    Recent Activity
                  </h3>

                  <p>
                    Your latest updates
                  </p>

                </div>

              </div>

            )}

          </section>

          {/* ACTIVITY */}

          <section className="dashboard-middle-grid">

            <div className="recent-activity-panel">

              <div className="panel-header">

                <div>

                  <span className="section-tag">
                    ACTIVITY
                  </span>

                  <h2>
                    Recent Activity
                  </h2>

                </div>

                <span className="activity-count">
                  {recentActivity.length} Activities
                </span>

              </div>

              <div className="activity-list">

                {recentActivity.length === 0 ? (

                  <div className="dashboard-empty">

                    <div className="dashboard-empty-icon">
                      📭
                    </div>

                    <h3>
                      No activity yet
                    </h3>

                    <p>
                      Create your first blog post.
                    </p>

                  </div>

                ) : (

                  recentActivity.map(
                    (activity, index) => (

                      <div
                        className="activity-item"
                        key={activity.id}
                      >

                        <div className="activity-left">

                          <div className="activity-icon">
                            {index === 0
                              ? "✨"
                              : "📝"}
                          </div>

                          <div>

                            <h4>
                              Published a blog post
                            </h4>

                            <p>
                              {activity.title}
                            </p>

                          </div>

                        </div>

                        <span className="activity-date">

                          {activity.created_at
                            ? new Date(
                                activity.created_at
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )
                            : "Today"}

                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="quick-actions-panel">

              <span className="section-tag">
                QUICK ACTIONS
              </span>

              <h2>
                What would you like to do?
              </h2>

              <p>
                Quickly access your most
                important CMS tools.
              </p>

              <button
                className="quick-action-btn"
                onClick={() => {
                  closeAllPages();
                  setShowCreatePost(true);
                }}
              >

                <span>✍️</span>

                <div>

                  <strong>
                    Create Post
                  </strong>

                  <small>
                    Write something new
                  </small>

                </div>

                <b>→</b>

              </button>

              <button
                className="quick-action-btn"
                onClick={handleMyPosts}
              >

                <span>📚</span>

                <div>

                  <strong>
                    Manage Posts
                  </strong>

                  <small>
                    Edit or delete posts
                  </small>

                </div>

                <b>→</b>

              </button>

              <button
                className="quick-action-btn"
                onClick={() => {
                  closeAllPages();
                  setShowPageBuilder(true);
                }}
              >

                <span>🏗️</span>

                <div>

                  <strong>
                    Page Builder
                  </strong>

                  <small>
                    Customize your website
                  </small>

                </div>

                <b>→</b>

              </button>

            </div>

          </section>

          {/* CMS TOOLS */}

          <section className="cms-features-section">

            <div className="dashboard-section-title">

              <div>

                <span className="section-tag">
                  CMS TOOLS
                </span>

                <h2>
                  Manage Your Content
                </h2>

                <p>
                  Everything you need to manage
                  your blog and website.
                </p>

              </div>

            </div>

            <div className="dashboard-grid">

              <div className="dashboard-card">

                <div className="feature-card-icon">
                  ✍️
                </div>

                <h3>
                  Create Blog Post
                </h3>

                <p>
                  Write and publish new content.
                </p>

                <button
                  onClick={() => {
                    closeAllPages();
                    setShowCreatePost(true);
                  }}
                >
                  Create Post →
                </button>
                <button
  onClick={() => {
    setShowAccount(true);
    setShowCreatePost(false);
    setShowMyPosts(false);
    setShowPageBuilder(false);
    setShowPublicBlog(false);
  }}
>
  👤 My Account
</button>

              </div>

              <div className="dashboard-card">

                <div className="feature-card-icon">
                  📚
                </div>

                <h3>
                  My Blog Posts
                </h3>

                <p>
                  Manage and organize your posts.
                </p>

                <button
                  onClick={handleMyPosts}
                >
                  Manage Posts →
                </button>

              </div>

              <div className="dashboard-card">

                <div className="feature-card-icon">
                  🌍
                </div>

                <h3>
                  Public Blog
                </h3>

                <p>
                  Explore your blog as visitors
                  see it.
                </p>

                <button
                  onClick={handlePublicBlog}
                >
                  View Blog →
                </button>

                

              </div>

              <div className="dashboard-card">

                <div className="feature-card-icon">
                  🏗️
                </div>

                <h3>
                  Website Builder
                </h3>

                <p>
                  Build your website with drag
                  and drop.
                </p>

                <button
                  onClick={() => {
                    closeAllPages();
                    setShowPageBuilder(true);
                  }}
                >
                  Open Builder →
                </button>

              </div>

              <div className="dashboard-card">

                <div className="feature-card-icon">
                  🌐
                </div>

                <h3>
                  View My Website
                </h3>

                <p>
                  Preview your website as visitors
                  see it.
                </p>

                <button
                  onClick={handleViewMyWebsite}
                >
                  View Website →
                </button>

              </div>

            </div>

          </section>

          <footer className="dashboard-footer">

            <p>
              © 2026 Webora Platform
            </p>

            <span>
              Built with ❤️ for creators
            </span>

          </footer>

        </main>

      </div>
    );
  }

  // =====================================================
  // LANDING PAGE
  // =====================================================

  if (!isLoggedIn && !showAuthPage) {
    return (
      <div className="landing-page">

        <div className="landing-orb landing-orb-one"></div>
        <div className="landing-orb landing-orb-two"></div>
        <div className="landing-grid"></div>

        {/* NAVBAR */}

        <header className="landing-navbar">

          <div className="landing-brand">

            <div className="landing-logo">
              <span className="webora-logo-letter">W</span>
            </div>

            <div>

              <h2>Webora</h2>

              <span>
                Content Management System
              </span>

            </div>

          </div>

          <nav className="landing-nav-links">

            <button
              onClick={() =>
                document
                  .getElementById("home")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Features
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              About
            </button>

          </nav>

          <div className="landing-auth-buttons">

            <button
              className="landing-login-btn"
              onClick={() => {
                setIsRegister(false);
                setShowAuthPage(true);
                setMessage("");
              }}
            >
              Sign In
            </button>

            <button
              className="landing-get-started-btn"
              onClick={() => {
                setIsRegister(true);
                setShowAuthPage(true);
                setMessage("");
              }}
            >
              Get Started
              <span>→</span>
            </button>

          </div>

        </header>

        {/* HERO */}

        <main
          id="home"
          className="landing-hero"
        >

          <div className="landing-hero-content">

            <div className="landing-badge">
              <span>✨</span>
              CREATE • DESIGN • PUBLISH
            </div>

            <h1>
              Build Your Ideas.
              <span>
                Share Your Story.
              </span>
            </h1>

            <p>
              Create beautiful blog posts,
              manage your content, and design
              your own website using one
              powerful CMS platform.
            </p>

            <div className="landing-hero-buttons">

              <button
                className="landing-primary-btn"
                onClick={() => {
                  setIsRegister(true);
                  setShowAuthPage(true);
                }}
              >
                Start Creating
                <span>→</span>
              </button>

              <button
                className="landing-secondary-btn"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Explore Features ↓
              </button>

            </div>

            <div className="landing-users">

              <div className="landing-user-group">

                <div className="landing-user-avatar">
                  C
                </div>

                <div className="landing-user-avatar">
                  M
                </div>

                <div className="landing-user-avatar">
                  S
                </div>

                <div className="landing-user-avatar more">
                  +
                </div>

              </div>

              <p>
                Everything you need to create,
                manage and publish.
              </p>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="landing-hero-visual">

            <div className="landing-dashboard-preview">

              <div className="preview-header">

                <div className="preview-logo">
                  ✨
                </div>

                <div>

                  <strong>
                    Webora
                  </strong>

                  <span>
                    Creator Dashboard
                  </span>

                </div>

              </div>

              <div className="preview-content">

                <div className="preview-welcome">

                  <span>
                    Welcome back 👋
                  </span>

                  <h3>
                    Ready to create?
                  </h3>

                </div>

                <div className="preview-stats">

                  <div className="preview-stat">
                    <span>📝</span>

                    <strong>
                      Blog Posts
                    </strong>
                  </div>

                  <div className="preview-stat">
                    <span>🌐</span>

                    <strong>
                      Website
                    </strong>
                  </div>

                  <div className="preview-stat">
                    <span>🎨</span>

                    <strong>
                      Builder
                    </strong>
                  </div>

                </div>

                <button
                  className="preview-create-btn"
                >
                  + Create New Post
                </button>

              </div>

            </div>

            <div className="floating-card floating-card-one">

              📝

              <div>

                <strong>
                  Create Content
                </strong>

                <span>
                  Write amazing stories
                </span>

              </div>

            </div>

            <div className="floating-card floating-card-two">

              🎨

              <div>

                <strong>
                  Design Website
                </strong>

                <span>
                  Drag & Drop Builder
                </span>

              </div>

            </div>

          </div>

        </main>

        {/* FEATURES */}

        <section
          id="features"
          className="landing-features"
        >

          <div className="landing-section-header">

            <span>
              POWERFUL CMS TOOLS
            </span>

            <h2>
              Everything You Need to
              <br />

              <strong>
                Create & Grow
              </strong>

            </h2>

            <p>
              One platform for creating content,
              designing websites and sharing
              your ideas.
            </p>

          </div>

          <div className="landing-feature-grid">

            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                ✍️
              </div>

              <h3>
                Create Content
              </h3>

              <p>
                Write, edit and publish amazing
                blog posts.
              </p>

            </div>

            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                🎨
              </div>

              <h3>
                Build Your Website
              </h3>

              <p>
                Design your website using an easy
                drag and drop builder.
              </p>

            </div>

            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                🚀
              </div>

              <h3>
                Publish & Grow
              </h3>

              <p>
                Share your stories and reach your
                audience.
              </p>

            </div>

            <div className="landing-feature-card">

              <div className="landing-feature-icon">
                📊
              </div>

              <h3>
                Manage Everything
              </h3>

              <p>
                Track your posts and manage your
                content from one dashboard.
              </p>

            </div>

          </div>

        </section>

        {/* ABOUT */}

        <section
          id="about"
          className="landing-about"
        >

          <div className="landing-about-content">

            <div>

              <span className="landing-about-label">
                ABOUT Webora
              </span>

              <h2>
                Your Ideas Deserve

                <span>
                  A Beautiful Platform.
                </span>

              </h2>

              <p>
                Webora is a complete content
                management platform designed to
                help creators write blogs,
                design websites and share their
                ideas easily.
              </p>

              <button
                className="landing-primary-btn"
                onClick={() => {
                  setIsRegister(true);
                  setShowAuthPage(true);
                }}
              >
                Join Webora →
              </button>

            </div>

            <div className="landing-about-box">

              <div>

                <span>✨</span>

                <h3>
                  Simple
                </h3>

                <p>
                  Easy for everyone
                </p>

              </div>

              <div>

                <span>⚡</span>

                <h3>
                  Powerful
                </h3>

                <p>
                  Everything in one place
                </p>

              </div>

              <div>

                <span>🎨</span>

                <h3>
                  Creative
                </h3>

                <p>
                  Design without limits
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="landing-cta">

          <div>

            <span>
              🚀 START YOUR JOURNEY
            </span>

            <h2>
              Ready to Share Your Story?
            </h2>

            <p>
              Create your account and start
              building something amazing today.
            </p>

            <button
              className="landing-cta-btn"
              onClick={() => {
                setIsRegister(true);
                setShowAuthPage(true);
              }}
            >
              Get Started for Free →
            </button>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="landing-footer">

          <div className="landing-footer-brand">

            🌐

            <div>

              <strong>
                Webora
              </strong>

              <span>
                Content Management System
              </span>

            </div>

          </div>

          <p>
            © 2026 Webora Platform.
            Built for creators.
          </p>

          <button
            onClick={() => {
              setIsRegister(false);
              setShowAuthPage(true);
            }}
          >
            Sign In →
          </button>

        </footer>

      </div>
    );
  }

  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  return (
    <div className="auth-page">

      <button
        className="auth-back-home-btn"
        onClick={() => {
          setShowAuthPage(false);
          setMessage("");
        }}
      >
        ← Back to Home
      </button>

      <div className="auth-bg-shape shape-one"></div>

      <div className="auth-bg-shape shape-two"></div>

      <div className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-brand-section">

          <div className="brand-top">

            <div className="logo-box">
  W
</div>


            <div>

              <h2>
                Webora
              </h2>

              <p>
                Content Management System
              </p>

            </div>

          </div>

          <div className="brand-main">

            <span className="brand-badge">
              ✨ CREATE • DESIGN • PUBLISH
            </span>

            <h1>
              Build Your Ideas.

              <br />

              <span>
                Share Your Story.
              </span>

            </h1>

            <p className="brand-description">
              Create beautiful blog posts,
              manage your content and build your
              own website using one powerful CMS
              platform.
            </p>

            <div className="brand-features">

              <div className="brand-feature">

                <div className="feature-icon">
                  ✍️
                </div>

                <div>

                  <h3>
                    Create Content
                  </h3>

                  <p>
                    Write and publish amazing
                    blog posts.
                  </p>

                </div>

              </div>

              <div className="brand-feature">

                <div className="feature-icon">
                  🏗️
                </div>

                <div>

                  <h3>
                    Build Your Website
                  </h3>

                  <p>
                    Design your website with drag
                    and drop.
                  </p>

                </div>

              </div>

              <div className="brand-feature">

                <div className="feature-icon">
                  🚀
                </div>

                <div>

                  <h3>
                    Grow Your Audience
                  </h3>

                  <p>
                    Share your ideas with the
                    world.
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div className="brand-footer">

            <div className="brand-users">

              <div className="user-circle">
                R
              </div>

              <div className="user-circle">
                A
              </div>

              <div className="user-circle">
                S
              </div>

              <div className="user-circle">
                +
              </div>

            </div>

            <p>
              Start creating something amazing
              today.
            </p>

          </div>

        </div>

        {/* AUTH FORM */}

        <div className="auth-form-section">

          <div className="auth-form-container">

            <div className="auth-tabs">

              <button
                className={
                  !isRegister
                    ? "active-auth-tab"
                    : ""
                }
                onClick={() => {
                  setIsRegister(false);
                  setMessage("");
                }}
              >
                Sign In
              </button>

              <button
                className={
                  isRegister
                    ? "active-auth-tab"
                    : ""
                }
                onClick={() => {
                  setIsRegister(true);
                  setMessage("");
                }}
              >
                Create Account
              </button>

            </div>

            {isRegister ? (

              <>
                <div className="auth-header">

                  <h1>
                    Create Account
                  </h1>

                  <p>
                    Start creating and sharing
                    your ideas today.
                  </p>

                </div>

                <form
                  className="auth-form"
                  onSubmit={handleRegister}
                >

                  <div className="auth-input-group">

                    <label>
                      Full Name
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        👤
                      </span>

                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="auth-input-group">

                    <label>
                      Email Address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉️
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="auth-input-group">

                    <label>
                      Password
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🔒
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        required
                      />

                      <button
                        type="button"
                        className="show-password-btn"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "🙈"
                          : "👁️"}
                      </button>

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                  >
                    <span>
                      Create Account
                    </span>

                    <span>
                      →
                    </span>
                  </button>

                </form>
              </>

            ) : (

              <>
                <div className="auth-header">

                  <h1>
                    Welcome Back
                  </h1>

                  <p>
                    Sign in to your account and
                    continue managing your
                    content.
                  </p>

                </div>

                <form
                  className="auth-form"
                  onSubmit={handleLogin}
                >

                  <div className="auth-input-group">

                    <label>
                      Email Address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✉️
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="auth-input-group">

                    <label>
                      Password
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        🔒
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        required
                      />

                      <button
                        type="button"
                        className="show-password-btn"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "🙈"
                          : "👁️"}
                      </button>

                    </div>

                  </div>

                  <div className="auth-options">

                    <label className="remember-me">

                      <input type="checkbox" />

                      <span>
                        Remember me
                      </span>

                    </label>

                    <button
                      type="button"
                      className="forgot-password"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                  >
                    <span>
                      Sign In to Dashboard
                    </span>

                    <span>
                      →
                    </span>
                  </button>

                </form>
              </>

            )}

            {message && (

              <div
                className={`auth-message ${
                  message
                    .toLowerCase()
                    .includes("successful")
                    ? "auth-success"
                    : message
                        .toLowerCase()
                        .includes("creating")
                      ? ""
                      : "auth-error"
                }`}
              >
                {message}
              </div>

            )}

            <div className="auth-footer">

              <p>
                © 2026 Webora Platform
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;