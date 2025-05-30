package com.example.myfirstapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myfirstapp.data.models.User
import com.example.myfirstapp.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val currentUser: User? = null,
    val error: String? = null,
    val isLoginMode: Boolean = true
)

class AuthViewModel : ViewModel() {
    
    private val authRepository = AuthRepository()
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    init {
        checkAuthStatus()
    }
    
    private fun checkAuthStatus() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            if (authRepository.isLoggedIn()) {
                // Try to get current user data
                authRepository.getCurrentUser()
                    .onSuccess { user ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            currentUser = user,
                            error = null
                        )
                    }
                    .onFailure { error ->
                        // Token might be invalid, logout
                        logout()
                    }
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isLoggedIn = false
                )
            }
        }
    }
    
    fun login(identifier: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            authRepository.login(identifier, password)
                .onSuccess { authResponse ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = true,
                        currentUser = authResponse.user,
                        error = null
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Login failed"
                    )
                }
        }
    }
    
    fun signup(
        firstName: String,
        lastName: String,
        username: String,
        mobile: String,
        password: String
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            authRepository.signup(firstName, lastName, username, mobile, password)
                .onSuccess { authResponse ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = true,
                        currentUser = authResponse.user,
                        error = null
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Signup failed"
                    )
                }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            authRepository.logout()
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = false,
                        currentUser = null,
                        error = null
                    )
                }
                .onFailure { error ->
                    // Even if logout fails on server, clear local state
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = false,
                        currentUser = null,
                        error = null
                    )
                }
        }
    }
    
    fun toggleAuthMode() {
        _uiState.value = _uiState.value.copy(
            isLoginMode = !_uiState.value.isLoginMode,
            error = null
        )
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    fun refreshUserData() {
        viewModelScope.launch {
            if (_uiState.value.isLoggedIn) {
                authRepository.getCurrentUser()
                    .onSuccess { user ->
                        _uiState.value = _uiState.value.copy(currentUser = user)
                    }
                    .onFailure { error ->
                        // Handle error silently or show a toast
                    }
            }
        }
    }
}
