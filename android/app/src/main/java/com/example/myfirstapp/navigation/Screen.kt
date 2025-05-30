package com.example.myfirstapp.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String) {
    object Auth : Screen("auth")
    object Home : Screen("home")
    object Profile : Screen("profile")
    object Upload : Screen("upload")
    object Settings : Screen("settings")
    object PostDetail : Screen("post_detail/{postId}") {
        fun createRoute(postId: String) = "post_detail/$postId"
    }
    object UserProfile : Screen("user_profile/{userId}") {
        fun createRoute(userId: String) = "user_profile/$userId"
    }
}

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    object Home : BottomNavItem(
        route = Screen.Home.route,
        title = "Home",
        icon = Icons.Default.Home
    )

    object Upload : BottomNavItem(
        route = Screen.Upload.route,
        title = "Upload",
        icon = Icons.Default.Add
    )

    object Profile : BottomNavItem(
        route = Screen.Profile.route,
        title = "Profile",
        icon = Icons.Default.Person
    )

    object Settings : BottomNavItem(
        route = Screen.Settings.route,
        title = "Settings",
        icon = Icons.Default.Settings
    )
}
