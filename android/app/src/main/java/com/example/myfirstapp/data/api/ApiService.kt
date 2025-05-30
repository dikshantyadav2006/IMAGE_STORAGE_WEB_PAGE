package com.example.myfirstapp.data.api

import com.example.myfirstapp.data.models.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Authentication endpoints
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/signup")
    suspend fun signup(@Body request: SignupRequest): Response<AuthResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<AuthResponse>

    @GET("auth/userdata")
    suspend fun getUserData(): Response<User>

    // Post endpoints
    @GET("posts/explore")
    suspend fun getPosts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12
    ): Response<PostsResponse>

    @GET("posts/user/{userId}")
    suspend fun getUserPosts(
        @Path("userId") userId: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12
    ): Response<PostsResponse>

    @GET("posts/my-posts")
    suspend fun getCurrentUserPosts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12
    ): Response<PostsResponse>

    @Multipart
    @POST("posts/android-upload")
    suspend fun createPost(
        @Part image: MultipartBody.Part,
        @Part("caption") caption: RequestBody,
        @Part("tags") tags: RequestBody,
        @Part("isPrivate") isPrivate: RequestBody
    ): Response<PostResponse>

    @Multipart
    @POST("posts/upload-anonymous")
    suspend fun createAnonymousPost(
        @Part image: MultipartBody.Part,
        @Part("caption") caption: RequestBody? = null,
        @Part("tags") tags: RequestBody? = null,
        @Part("username") username: RequestBody? = null
    ): Response<PostResponse>

    @DELETE("posts/{postId}")
    suspend fun deletePost(@Path("postId") postId: String): Response<PostResponse>

    @PUT("posts/{postId}")
    suspend fun updatePost(
        @Path("postId") postId: String,
        @Body request: PostCreateRequest
    ): Response<PostResponse>

    // Profile endpoints
    @GET("profile/{username}")
    suspend fun getUserProfile(@Path("username") username: String): Response<User>

    @Multipart
    @POST("profile/upload-profile-pic")
    suspend fun uploadProfilePicture(
        @Part profilePic: MultipartBody.Part
    ): Response<AuthResponse>

    // User endpoints
    @PUT("user/edit-user/{id}")
    suspend fun updateUser(
        @Path("id") userId: String,
        @Body request: UserUpdateRequest
    ): Response<AuthResponse>

    @GET("user/user/{id}")
    suspend fun getUserById(@Path("id") userId: String): Response<User>
}
