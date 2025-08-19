// Comments
function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then(setComments);
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ use JWT
      },
      body: JSON.stringify({ content: text }), // ✅ no user_id
    });

    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setText("");
  };

  return (
    <div className="mt-2 space-y-2">
      <form onSubmit={submitComment} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-3 rounded-lg hover:bg-purple-700"
        >
          Post
        </button>
      </form>

      {comments.map((c) => (
        <div key={c.id} className="bg-gray-50 p-2 rounded-lg">
          <strong>{c.username}</strong>: {c.content}
          <div className="text-xs text-gray-400">
            {new Date(c.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Comments;
