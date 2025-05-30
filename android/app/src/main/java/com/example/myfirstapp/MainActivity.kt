package com.example.myfirstapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.myfirstapp.data.api.ApiClient
import com.example.myfirstapp.navigation.BottomNavItem
import com.example.myfirstapp.navigation.Screen
import com.example.myfirstapp.ui.screens.*
import com.example.myfirstapp.ui.theme.MyFirstAppTheme
import com.example.myfirstapp.ui.viewmodel.AuthViewModel
import com.example.myfirstapp.ui.viewmodel.PostViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize API client
        ApiClient.initialize(this)

        setContent {
            MyFirstAppTheme {
                ImageGalleryApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImageGalleryApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    val postViewModel: PostViewModel = viewModel()

    val authUiState by authViewModel.uiState.collectAsStateWithLifecycle()

    if (authUiState.isLoading) {
        // Show loading screen while checking auth status
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = androidx.compose.ui.Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (!authUiState.isLoggedIn) {
        // Show auth screen if not logged in
        AuthScreen(
            authViewModel = authViewModel,
            onAuthSuccess = {
                // Navigation will be handled by the auth state change
            }
        )
    } else {
        // Show main app with bottom navigation
        MainAppContent(
            navController = navController,
            authViewModel = authViewModel,
            postViewModel = postViewModel
        )
    }
}

@Composable
fun MainAppContent(
    navController: androidx.navigation.NavHostController,
    authViewModel: AuthViewModel,
    postViewModel: PostViewModel
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val bottomNavItems = listOf(
        BottomNavItem.Home,
        BottomNavItem.Upload,
        BottomNavItem.Profile,
        BottomNavItem.Settings
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    postViewModel = postViewModel,
                    onPostClick = { postId ->
                        navController.navigate(Screen.PostDetail.createRoute(postId))
                    }
                )
            }

            composable(Screen.Upload.route) {
                UploadScreen(
                    postViewModel = postViewModel,
                    authViewModel = authViewModel,
                    onUploadSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    authViewModel = authViewModel,
                    postViewModel = postViewModel
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    authViewModel = authViewModel,
                    onLogout = {
                        // Navigation will be handled by auth state change
                    }
                )
            }
        }
    }
}
