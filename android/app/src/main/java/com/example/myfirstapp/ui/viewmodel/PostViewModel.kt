package com.example.myfirstapp.ui.viewmodel

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myfirstapp.data.models.Post
import com.example.myfirstapp.data.repository.PostRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File

data class PostUiState(
    val isLoading: Boolean = false,
    val posts: List<Post> = emptyList(),
    val userPosts: List<Post> = emptyList(),
    val isUploading: Boolean = false,
    val error: String? = null,
    val currentPage: Int = 1,
    val hasMorePages: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingUserPosts: Boolean = false,
    val userPostsError: String? = null
)

class PostViewModel : ViewModel() {

    private val postRepository = PostRepository()

    private val _uiState = MutableStateFlow(PostUiState())
    val uiState: StateFlow<PostUiState> = _uiState.asStateFlow()

    init {
        loadPosts()
    }

    fun loadPosts(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true, error = null)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }

            val page = if (refresh) 1 else _uiState.value.currentPage

            postRepository.getPosts(page)
                .onSuccess { postsResponse ->
                    val newPosts = if (refresh) {
                        postsResponse.posts
                    } else {
                        _uiState.value.posts + postsResponse.posts
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        posts = newPosts,
                        currentPage = postsResponse.currentPage,
                        hasMorePages = postsResponse.currentPage < postsResponse.totalPages,
                        error = null
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = error.message ?: "Failed to load posts"
                    )
                }
        }
    }

    fun loadMorePosts() {
        if (_uiState.value.hasMorePages && !_uiState.value.isLoading) {
            viewModelScope.launch {
                _uiState.value = _uiState.value.copy(isLoading = true)

                postRepository.getPosts(_uiState.value.currentPage + 1)
                    .onSuccess { postsResponse ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            posts = _uiState.value.posts + postsResponse.posts,
                            currentPage = postsResponse.currentPage,
                            hasMorePages = postsResponse.currentPage < postsResponse.totalPages,
                            error = null
                        )
                    }
                    .onFailure { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message ?: "Failed to load more posts"
                        )
                    }
            }
        }
    }

    fun createPost(
        context: Context,
        imageFile: File,
        caption: String,
        tags: String,
        isPrivate: Boolean
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUploading = true, error = null)

            postRepository.createPost(context, imageFile, caption, tags, isPrivate)
                .onSuccess { postResponse ->
                    _uiState.value = _uiState.value.copy(isUploading = false)
                    // Refresh posts to show the new post
                    loadPosts(refresh = true)
                    // Also refresh user posts for profile screen
                    loadCurrentUserPosts()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isUploading = false,
                        error = error.message ?: "Failed to create post"
                    )
                }
        }
    }

    fun createAnonymousPost(
        context: Context,
        imageFile: File,
        caption: String? = null,
        tags: String? = null,
        username: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUploading = true, error = null)

            postRepository.createAnonymousPost(context, imageFile, caption, tags, username)
                .onSuccess { postResponse ->
                    _uiState.value = _uiState.value.copy(isUploading = false)
                    // Refresh posts to show the new post
                    loadPosts(refresh = true)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isUploading = false,
                        error = error.message ?: "Failed to create anonymous post"
                    )
                }
        }
    }

    fun deletePost(postId: String) {
        viewModelScope.launch {
            postRepository.deletePost(postId)
                .onSuccess {
                    // Remove post from current list
                    val updatedPosts = _uiState.value.posts.filter { it.id != postId }
                    _uiState.value = _uiState.value.copy(posts = updatedPosts)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to delete post"
                    )
                }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun refreshPosts() {
        loadPosts(refresh = true)
    }

    fun loadCurrentUserPosts() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingUserPosts = true, userPostsError = null)

            postRepository.getCurrentUserPosts()
                .onSuccess { postsResponse ->
                    _uiState.value = _uiState.value.copy(
                        isLoadingUserPosts = false,
                        userPosts = postsResponse.posts,
                        userPostsError = null
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoadingUserPosts = false,
                        userPostsError = error.message ?: "Failed to load user posts"
                    )
                }
        }
    }

    fun refreshUserPosts() {
        loadCurrentUserPosts()
    }

    // Helper function to copy URI to file
    suspend fun copyUriToFile(context: Context, uri: Uri): File? {
        return postRepository.copyUriToFile(context, uri)
    }
}
