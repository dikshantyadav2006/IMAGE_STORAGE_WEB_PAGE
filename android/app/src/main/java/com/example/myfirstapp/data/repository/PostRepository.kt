package com.example.myfirstapp.data.repository

import android.content.Context
import android.net.Uri
import com.example.myfirstapp.data.api.ApiClient
import com.example.myfirstapp.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class PostRepository {
    
    private val apiService = ApiClient.apiService
    
    suspend fun getPosts(page: Int = 1, limit: Int = 12): Result<PostsResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getPosts(page, limit)
                
                if (response.isSuccessful) {
                    val postsResponse = response.body()
                    if (postsResponse != null) {
                        Result.success(postsResponse)
                    } else {
                        Result.failure(Exception("No posts data received"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to fetch posts"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun getUserPosts(userId: String, page: Int = 1, limit: Int = 12): Result<PostsResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getUserPosts(userId, page, limit)
                
                if (response.isSuccessful) {
                    val postsResponse = response.body()
                    if (postsResponse != null) {
                        Result.success(postsResponse)
                    } else {
                        Result.failure(Exception("No posts data received"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to fetch user posts"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun createPost(
        context: Context,
        imageFile: File,
        caption: String,
        tags: String,
        isPrivate: Boolean
    ): Result<PostResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val requestFile = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
                val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestFile)
                
                val captionBody = caption.toRequestBody("text/plain".toMediaTypeOrNull())
                val tagsBody = tags.toRequestBody("text/plain".toMediaTypeOrNull())
                val isPrivateBody = isPrivate.toString().toRequestBody("text/plain".toMediaTypeOrNull())
                
                val response = apiService.createPost(imagePart, captionBody, tagsBody, isPrivateBody)
                
                if (response.isSuccessful) {
                    val postResponse = response.body()
                    if (postResponse != null) {
                        Result.success(postResponse)
                    } else {
                        Result.failure(Exception("Invalid response from server"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to create post"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun createAnonymousPost(
        context: Context,
        imageFile: File,
        caption: String? = null,
        tags: String? = null,
        username: String? = null
    ): Result<PostResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val requestFile = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
                val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestFile)
                
                val captionBody = caption?.toRequestBody("text/plain".toMediaTypeOrNull())
                val tagsBody = tags?.toRequestBody("text/plain".toMediaTypeOrNull())
                val usernameBody = username?.toRequestBody("text/plain".toMediaTypeOrNull())
                
                val response = apiService.createAnonymousPost(imagePart, captionBody, tagsBody, usernameBody)
                
                if (response.isSuccessful) {
                    val postResponse = response.body()
                    if (postResponse != null) {
                        Result.success(postResponse)
                    } else {
                        Result.failure(Exception("Invalid response from server"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to create anonymous post"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun deletePost(postId: String): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.deletePost(postId)
                
                if (response.isSuccessful) {
                    Result.success(true)
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to delete post"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    // Helper function to copy URI content to a file
    suspend fun copyUriToFile(context: Context, uri: Uri): File? {
        return withContext(Dispatchers.IO) {
            try {
                val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
                val tempFile = File(context.getExternalFilesDir(null), "temp_image_${System.currentTimeMillis()}.jpg")
                
                inputStream?.use { input ->
                    FileOutputStream(tempFile).use { output ->
                        input.copyTo(output)
                    }
                }
                tempFile
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}
