package com.example.myfirstapp.data.models

import com.google.gson.annotations.SerializedName

data class Post(
    @SerializedName("_id")
    val id: String = "",
    val user: User? = null,
    val caption: String = "",
    val imageUrl: String = "",
    val cloudinaryId: String = "",
    val tags: List<String> = emptyList(),
    val isPrivate: Boolean = false,
    val anonymousUsername: String? = null,
    val likes: List<String> = emptyList(),
    val comments: List<Comment> = emptyList(),
    val createdAt: String = "",
    val updatedAt: String = ""
)

data class Comment(
    @SerializedName("_id")
    val id: String = "",
    val user: User? = null,
    val text: String = "",
    val createdAt: String = ""
)

data class PostCreateRequest(
    val caption: String,
    val tags: String, // comma-separated tags
    val isPrivate: Boolean = false
)

data class PostResponse(
    val message: String,
    val success: Boolean = false,
    val data: PostData? = null
)

data class PostData(
    val postId: String,
    val imageUrl: String,
    val caption: String,
    val tags: List<String>,
    val isPrivate: Boolean? = null,
    val anonymousUsername: String? = null,
    val createdAt: String,
    val user: PostUser? = null
)

data class PostUser(
    val id: String,
    val username: String
)

data class PostsResponse(
    val posts: List<Post>,
    val totalPages: Int,
    val currentPage: Int,
    val success: Boolean = true
)

data class AnonymousPostRequest(
    val caption: String? = null,
    val tags: String? = null,
    val username: String? = null
)
