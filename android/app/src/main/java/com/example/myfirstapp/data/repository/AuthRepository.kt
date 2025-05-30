package com.example.myfirstapp.data.repository

import com.example.myfirstapp.data.api.ApiClient
import com.example.myfirstapp.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository {
    
    private val apiService = ApiClient.apiService
    
    suspend fun login(identifier: String, password: String): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = LoginRequest(identifier, password)
                val response = apiService.login(request)
                
                if (response.isSuccessful) {
                    val authResponse = response.body()
                    if (authResponse != null && authResponse.token != null) {
                        // Save token to DataStore
                        ApiClient.saveToken(authResponse.token)
                        Result.success(authResponse)
                    } else {
                        Result.failure(Exception("Invalid response from server"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Login failed"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun signup(
        firstName: String,
        lastName: String,
        username: String,
        mobile: String,
        password: String
    ): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = SignupRequest(firstName, lastName, username, mobile, password)
                val response = apiService.signup(request)
                
                if (response.isSuccessful) {
                    val authResponse = response.body()
                    if (authResponse != null && authResponse.token != null) {
                        // Save token to DataStore
                        ApiClient.saveToken(authResponse.token)
                        Result.success(authResponse)
                    } else {
                        Result.failure(Exception("Invalid response from server"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Signup failed"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun logout(): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.logout()
                // Clear token regardless of server response
                ApiClient.clearToken()
                
                if (response.isSuccessful) {
                    Result.success(true)
                } else {
                    // Still return success since we cleared the local token
                    Result.success(true)
                }
            } catch (e: Exception) {
                // Clear token even if network call fails
                ApiClient.clearToken()
                Result.success(true)
            }
        }
    }
    
    suspend fun getCurrentUser(): Result<User> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getUserData()
                
                if (response.isSuccessful) {
                    val user = response.body()
                    if (user != null) {
                        Result.success(user)
                    } else {
                        Result.failure(Exception("User data not found"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to get user data"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun updateUser(userId: String, updateRequest: UserUpdateRequest): Result<User> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.updateUser(userId, updateRequest)
                
                if (response.isSuccessful) {
                    val authResponse = response.body()
                    if (authResponse != null && authResponse.user != null) {
                        Result.success(authResponse.user)
                    } else {
                        Result.failure(Exception("Invalid response from server"))
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Update failed"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    fun isLoggedIn(): Boolean {
        return ApiClient.isTokenAvailable()
    }
}
