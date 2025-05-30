package com.example.myfirstapp.ui.screens

import android.Manifest
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Camera
import androidx.compose.material.icons.filled.Photo
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.rememberAsyncImagePainter
import com.example.myfirstapp.ui.viewmodel.AuthViewModel
import com.example.myfirstapp.ui.viewmodel.PostViewModel
import kotlinx.coroutines.launch
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadScreen(
    postViewModel: PostViewModel,
    authViewModel: AuthViewModel,
    onUploadSuccess: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    val postUiState by postViewModel.uiState.collectAsStateWithLifecycle()
    val authUiState by authViewModel.uiState.collectAsStateWithLifecycle()
    
    // Form states
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var caption by remember { mutableStateOf("") }
    var tags by remember { mutableStateOf("") }
    var isPrivate by remember { mutableStateOf(false) }
    var showBottomSheet by remember { mutableStateOf(false) }
    var anonymousUsername by remember { mutableStateOf("") }
    
    val snackbarHostState = remember { SnackbarHostState() }
    
    // Create image file for camera
    val imageFile = remember {
        File(context.getExternalFilesDir(null), "captured_photo_${System.currentTimeMillis()}.jpg")
    }
    val imageUri = remember(imageFile) {
        FileProvider.getUriForFile(context, "${context.packageName}.provider", imageFile)
    }
    
    // Camera launcher
    val takePictureLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            selectedImageUri = imageUri
        }
    }
    
    // Gallery launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        selectedImageUri = uri
    }
    
    // Camera permission launcher
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            takePictureLauncher.launch(imageUri)
        } else {
            coroutineScope.launch {
                snackbarHostState.showSnackbar("Camera permission is required to take photos")
            }
        }
    }
    
    // Handle upload success
    LaunchedEffect(postUiState.isUploading) {
        if (!postUiState.isUploading && selectedImageUri != null && postUiState.error == null) {
            // Reset form after successful upload
            selectedImageUri = null
            caption = ""
            tags = ""
            isPrivate = false
            anonymousUsername = ""
            onUploadSuccess()
        }
    }
    
    // Show error messages
    LaunchedEffect(postUiState.error) {
        postUiState.error?.let { error ->
            snackbarHostState.showSnackbar(error)
            postViewModel.clearError()
        }
    }
    
    // Bottom Sheet for image selection
    if (showBottomSheet) {
        ModalBottomSheet(
            onDismissRequest = { showBottomSheet = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Select Image Source",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                // Camera option
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            showBottomSheet = false
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                        .padding(vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Camera,
                        contentDescription = "Camera",
                        modifier = Modifier.padding(end = 16.dp)
                    )
                    Text(
                        text = "Take Photo",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                
                // Gallery option
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            showBottomSheet = false
                            galleryLauncher.launch("image/*")
                        }
                        .padding(vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Photo,
                        contentDescription = "Gallery",
                        modifier = Modifier.padding(end = 16.dp)
                    )
                    Text(
                        text = "Choose from Gallery",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Create Post",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            // Image selection
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .clickable { showBottomSheet = true },
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                if (selectedImageUri != null) {
                    Image(
                        painter = rememberAsyncImagePainter(selectedImageUri),
                        contentDescription = "Selected Image",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Photo,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Tap to select image",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
            
            // Caption
            OutlinedTextField(
                value = caption,
                onValueChange = { caption = it },
                label = { Text("Caption") },
                modifier = Modifier.fillMaxWidth(),
                maxLines = 3
            )
            
            // Tags
            OutlinedTextField(
                value = tags,
                onValueChange = { tags = it },
                label = { Text("Tags (comma separated)") },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("nature, photography, art") }
            )
            
            // Privacy toggle (only for authenticated users)
            if (authUiState.isLoggedIn) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Switch(
                        checked = isPrivate,
                        onCheckedChange = { isPrivate = it }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Private post",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else {
                // Anonymous username for non-authenticated users
                OutlinedTextField(
                    value = anonymousUsername,
                    onValueChange = { anonymousUsername = it },
                    label = { Text("Your name (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Anonymous") }
                )
            }
            
            // Upload button
            Button(
                onClick = {
                    selectedImageUri?.let { uri ->
                        coroutineScope.launch {
                            val imageFile = if (uri == imageUri) {
                                // Camera image
                                imageFile
                            } else {
                                // Gallery image
                                postViewModel.copyUriToFile(context, uri)
                            }
                            
                            imageFile?.let { file ->
                                if (authUiState.isLoggedIn) {
                                    postViewModel.createPost(
                                        context = context,
                                        imageFile = file,
                                        caption = caption,
                                        tags = tags,
                                        isPrivate = isPrivate
                                    )
                                } else {
                                    postViewModel.createAnonymousPost(
                                        context = context,
                                        imageFile = file,
                                        caption = caption.ifBlank { null },
                                        tags = tags.ifBlank { null },
                                        username = anonymousUsername.ifBlank { null }
                                    )
                                }
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = selectedImageUri != null && !postUiState.isUploading
            ) {
                if (postUiState.isUploading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Upload Post")
                }
            }
        }
    }
}
