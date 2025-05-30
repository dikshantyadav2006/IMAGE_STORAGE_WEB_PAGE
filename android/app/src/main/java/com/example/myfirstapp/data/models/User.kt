package com.example.myfirstapp.data.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id")
    val id: String = "",
    val username: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val mobile: String = "",
    val email: String? = null,
    val profilePic: String? = null,
    val bio: String? = null,
    val gender: String? = null,
    val private: Boolean = false,
    val showProfilePicture: Boolean = true,
    val totalPosts: Int = 0,
    val followers: List<String> = emptyList(),
    val following: List<String> = emptyList(),
    val posts: List<String> = emptyList(),
    val createdAt: String = "",
    val updatedAt: String = ""
)

data class LoginRequest(
    val identifier: String, // username or mobile
    val password: String
)

data class SignupRequest(
    val firstName: String,
    val lastName: String,
    val username: String,
    val mobile: String,
    val password: String
)

data class AuthResponse(
    val message: String,
    val token: String? = null,
    val user: User? = null,
    val success: Boolean = false
)

data class UserUpdateRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val username: String? = null,
    val gender: String? = null,
    val email: String? = null,
    val bio: String? = null,
    val isPrivate: Boolean? = null,
    val showProfilePicture: Boolean? = null
)
