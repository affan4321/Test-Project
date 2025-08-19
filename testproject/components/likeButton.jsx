// LikeButton
function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);

  const toggleLike = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // ✅ use JWT
      },
    });
    const data = await res.json();
    setLiked(data.liked);
  };

  return (
    <button
      onClick={toggleLike}
      className={`font-bold ${liked ? "text-red-500" : "text-gray-500"}`}
    >
      ♥
    </button>
  );
}

export default LikeButton;