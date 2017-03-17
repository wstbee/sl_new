//var root = 'http://localhost:3000'
var root = 'http://52.79.194.142';

angular.module('starter.controllers', [])


	.factory('UserAuth', function ($window) {
		var UserAuth = this

		UserAuth.removeToken = function () {
			var res = $window.localStorage.token ? true : false
			$window.localStorage.token = null
			return res
		}
		UserAuth.setToken = function (token) {
			return $window.localStorage.token = token;
		}
		UserAuth.getToken = function () {
			return $window.localStorage.token;
		}
		UserAuth.isSessionActive = function () {
			return ($window.localStorage.token!='null') ? true : false;
		}
		UserAuth.setCurrentUser = function (user){
			if(user) {
				$window.localStorage.setItem('CurrentUser', angular.toJson(user))
				return true
			}else{
				return false
			}
		}
		UserAuth.getCurrentUser = function (){
			return angular.fromJson($window.localStorage.getItem('CurrentUser'))
		}
		UserAuth.removeCurrentUser = function (){
			$window.localStorage.removeItem('CurrentUser')
			return true
		}
		UserAuth.setOptions = function (options){
			$window.localStorage.setItem('Options', angular.toJson(options))
			return true
		}
		UserAuth.getOptions = function (){
			var options = angular.fromJson($window.localStorage.getItem('Options'))
			if (options == null){
				options = { gender: 2 }
			}
			console.log(options.gender)
			return options
		}
		return UserAuth
	})

	.service('UserSvc', function ($http, UserAuth) {
		var svc = this
		svc.getUser = function (){
			return $http.get(root+'/api/user', {
				headers: {'X-Auth': this.token}
			})
		}
		svc.login = function (username, password) {
			return $http.post(root+'/api/session', {
				username: username, password: password
			}).then(function (val){
				if(val.data!=null){
					svc.token = val.data
					UserAuth.setToken(val.data)
					$http.defaults.headers.common['X-Auth'] = val.data
					return svc.getUser()
				}else{
					return false
				}
			})
		}
	})



	.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, UserSvc, UserAuth) {

		// With the new view caching in Ionic, Controllers are only called
		// when they are recreated or on app start, instead of every page change.
		// To listen for when this page is active (for example, to refresh data),
		// listen for the $ionicView.enter event:
		//$scope.$on('$ionicView.enter', function(e) {
		//});
		$scope.root = root;
		// Form data for the login modal
		$scope.loginData = {};

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl('templates/login.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
		});

		// Triggered in the login modal to close it
		$scope.closeLogin = function() {
			$scope.modal.hide();
		};

		// Open the login modal
		$scope.login = function() {
			$scope.modal.show();
		};

	})

	.controller('HomeCtrl', function($scope, $ionicModal, $http, $cordovaFileTransfer, UserAuth, $cordovaCamera) {

		$scope.sex = { value : UserAuth.getOptions().gender }
		$scope.root = root;
		$scope.requestURL = root+'/api/photo'
		$scope.getCurrentUser= UserAuth.getCurrentUser;
		$scope.isSessionActive = UserAuth.isSessionActive;

		$scope.setURL = function (){
			if($scope.sex.value == 2) { $scope.requestURL = root+'/api/photo' }
			else if($scope.sex.value == 1) { $scope.requestURL = root+'/api/photo/gender/1' }
			else { $scope.requestURL = root+'/api/photo/gender/0' }
			return
		}
		$scope.setURL()

		//getPhotos()
		var countMax = 2;

		function goTinder() {
			console.log("test");
			$scope.count = countMax;

			$("#tinderslide").jTinder({
				onDislike: function (item) {
					$scope.count--;

					$http.put(root+'/api/photo/'+$scope.photos[$scope.count].image_path+'/like/0')
						.success(function(res){ })
						.error(function(err){ console.log(err); });

					if(UserAuth.isSessionActive()){
						$http.put(root+'/api/user/'+UserAuth.getCurrentUser()+'/dislike/'+$scope.photos[$scope.count].image_path)
							.success(function(res){ })
							.error(function(err){ console.log(err); });
					}

					if($scope.count == 0)
					{
						getPhotos();
					}
				},
				onLike: function (item) {
					$scope.count--;

					$http.put(root+'/api/photo/'+$scope.photos[$scope.count].image_path+'/like/1')
						.success(function(res){ })
						.error(function(err){ console.log(err); });

					if(UserAuth.isSessionActive()){
						$http.put(root+'/api/user/'+UserAuth.getCurrentUser()+'/like/'+$scope.photos[$scope.count].image_path)
							.success(function(res){ })
							.error(function(err){ console.log(err); });
					}

					if($scope.count == 0)
					{
						getPhotos();
					}
				},
				animationRevertSpeed: 200,
				animationSpeed: 400,
				threshold: 1,
				likeSelector: '.like',
				dislikeSelector: '.dislike'

			})
		}

		function getPhotos() {

			$("#tinderslide").remove();
			$("#tinderdiv").append('<div id="tinderslide" style="margin-top:-2% !important;margin-left:-10% !important; width:120%; height:605px;"><ul id="lis"><div class="mdl-spinner mdl-js-spinner is-active"></div><br><br><button class="mdl-button mdl-js-button mdl-js-ripple-effect"> Loading... </button></ul></div>');
			componentHandler.upgradeDom(); // CSS 적용

			$http.get($scope.requestURL).then(function (res){

				$scope.photos = res.data;

				var html_slide = "";

				$.each($scope.photos, function (index, value) {

					html_slide += '<li class="pane3" id="' + value.username + '"><div class="img"  pid="' + value.username + '" style="background: url(\''+ root + '/res/photos/'+value.image_path +'\') no-repeat scroll center center;background-size: cover;"></div>';

					if (value.instaID) {
						html_slide += "<div style='height:18px;font-size:10px;margin-top:8px;padding:0px 8px 8px;text-align:center;'><img src='../img/icon_instagram.png' style='width:auto;height:20px;'> <a href='https://instragram.com/"+value.instaID+"' style='text-decoration:none; color:black;'>@" + value.instaID + "</a></div>";
					} else {
						html_slide += "<div style='height:22px;'></div>";
					}
					html_slide += '<div style="padding-top:0px;"><!--i onclick="goScrap(' + value.username + ');	 $(this).addClass(\'md-red\');" class="material-icons md-light md-inactive star-btn">&#xE838;</i--><p style="font-size:12px;">' + (value.instaID ? "" : "") + '</p></div><div class="like"></div><div class="dislike"></div></li>';
				});

				$("#lis").html(html_slide);
				componentHandler.upgradeDom(); // CSS 적용

				goTinder();
			})
		}

		/*from here, functions for uploading camera & gallery Images*/

		var upload = function(serverURL, fileURL){

			var uploadOptions = new FileUploadOptions();
			uploadOptions.fileKey = "user_photo";
			uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
			uploadOptions.mimeType = "image/jpeg";
			uploadOptions.chunkedMode = false;
			uploadOptions.params = { fileURL : JSON.stringify(fileURL)};

			console.log(JSON.stringify(fileURL))

			$cordovaFileTransfer.upload(encodeURI(serverURL), fileURL, uploadOptions).then(
				function(result){
					console.log("Hi you ar in result")
					console.log("SUCCESS: " + JSON.stringify(result.response));

				},function(error){
					console.log(error);

				})

		};

		var takePicture = function(serverURL){
			var options = {
				quality          : 75,
				destinationType  : navigator.camera.DestinationType.FILE_URI,
				sourceType       : navigator.camera.PictureSourceType.CAMERA,
				allowEdit        : true,
				encodingType     : navigator.camera.EncodingType.JPEG,
				targetWidth      : 720,
				targetHeight     : 480,
				popoverOptions   : CameraPopoverOptions,
				saveToPhotoAlbum : false
			};

			navigator.camera.getPicture(function(imageURI) {

				upload(root+"/api/photo/"+UserAuth.getCurrentUser(), imageURI);

				console.log(root+"/api/photo/"+UserAuth.getCurrentUser())

			},function(err){

			}, options);
		};
		$scope.takePicture = takePicture;


		var uploadPhoto = function(serverURL){
			var options = {
				quality          : 75,
				destinationType  : navigator.camera.DestinationType.FILE_URI,
				sourceType       : navigator.camera.PictureSourceType.PHOTOLIBRARY,
				allowEdit        : true,
				encodingType     : navigator.camera.EncodingType.JPEG,
				targetWidth      : 300,
				targetHeight     : 300,
				popoverOptions   : CameraPopoverOptions,
				saveToPhotoAlbum : false
			};

			navigator.camera.getPicture(function(imageURI) {

				console.log('Hi You ar in Getpicture function')

				upload(root+"/api/photo/"+UserAuth.getCurrentUser(), imageURI);

				console.log(root+"/api/photo/"+UserAuth.getCurrentUser())
			},function(err){

			}, options);
		};

		$scope.uploadPhoto = uploadPhoto;

		/*from here, code for option modal*/

		$ionicModal.fromTemplateUrl('templates/options.html',{
			scope : $scope
		}).then(function(modal){
			$scope.modal = modal;

		});

		$scope.showOptions = function() {
			$scope.modal.show();
		};

		$scope.hideOptions = function(){
			$scope.setURL();
			getPhotos();
			var options = UserAuth.getOptions();
			options.gender = $scope.sex.value
			UserAuth.setOptions(options);
			$scope.modal.hide();
		};

		$scope.$on('$destroy', function(){ // when current view destroys , delete modal too
			$scope.modal.remove();
		})

		getPhotos();

	})


	.controller('BestLookCtrl', function($scope, $http){

		$scope.loadImage = function(){
			$http.get(root+'/api/bestlook').success(function(images){
				$scope.images=images;
			}
			).error(function(err){
				console.log(err);
			});
		};

		$scope.loadImage();



	})

	.controller('GalleryCtrl', function($scope, $http, $ionicModal, $ionicPopup, $state, $rootScope, $ionicHistory, UserAuth){
		$scope.root = root;
		$scope.images = [];
		$scope.pages=0;
		$scope.total=0;
		$scope.getCurrentUser= UserAuth.getCurrentUser;
		$scope.isSessionActive = UserAuth.isSessionActive;

		$scope.resetImg = function(){

			$http.get(root+'/api/user/'+$scope.user).success(function(info){
				$scope.images = [];
				$scope.pages=0;
				$scope.total=0;

				//console.log($scope.user)
				$scope.userInfo= info;
				$scope.uploadedImages = $scope.userInfo.photo_upload;
				$scope.total = $scope.uploadedImages.length;

				$scope.getMoreImages();

				//console.log($scope.images,$scope.total+": uploaded image urls loaded completed");
			}).error(function(err){
				console.log(err);
			});
		}

		// showImages- scroll
		$scope.showImages = function(index) {
			$scope.activeSlide = index;
			$scope.showModal('templates/imageModal.html');
		}



		$scope.showModal = function(templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				//animation: 'slide-in-up' for slide
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}

		$scope.removeImages = function(img_path, index, islast){
			console.log("next img "+index);
			$http.put(root+'/api/user/'+UserAuth.getCurrentUser()+'/upload_remove/'+img_path)
				.success(function(res){$scope.resetImg(); if(!islast) {$scope.showImages(index);}})
				.error(function(err){ console.log(err); });
		}


		// Close the modal
		$scope.closeModal = function() {
			$scope.modal.hide();
			$scope.modal.remove()
		};

		$scope.updateSlideStatus = function(slide) {
			var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
			if (zoomFactor == $scope.zoomMin) {
				$ionicSlideBoxDelegate.enableSlide(true);
			} else {
				$ionicSlideBoxDelegate.enableSlide(false);
			}
		};


		$scope.getMoreImages = function(){

			$scope.loadingUnit = $scope.pages ? 8 : 20 ;

			for(i = 0 ; i < $scope.loadingUnit ; i++){
				if($scope.total > $scope.loadingUnit * $scope.pages + i) {

					$scope.images.push($scope.uploadedImages[$scope.loadingUnit * $scope.pages + i])
				};
				console.log("loaded images # is "+ $scope.images.length)
			}

			$scope.pages++;

			console.log("getMoreImages!"+"pages: "+$scope.pages)
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
			if(toState.name == "app.gallery"){
				$scope.initialize()
			}
		})

		$scope.initialize = function(){
			if(!UserAuth.isSessionActive()){
				$ionicPopup.show({
					template: '<div>',
					title: '로그인이 필요합니다',
					subTitle: 'Please login to use gallery',
					scope: $scope,
					buttons: [
						{text: '<b>로그인하러 가기</b>', type: 'button-positive', onTap: function(e) {
							$ionicHistory.nextViewOptions({disableBack: true});
							$state.go('app.profile');
						}}
					]
				});
			}else{
				$scope.user =  $scope.getCurrentUser();
				$scope.resetImg();
			}
		}

		$scope.initialize()

	})


	.controller('ProfileCtrl', function($scope, $ionicModal, $timeout, $http, UserSvc, UserAuth, $window) {
		$scope.root = root;

		$scope.loginNew = function(){
			$scope.login_login = true
			$scope.login_new = true
		};

		$scope.loginNewCheck_id = function(){
			$http.get(root+'/api/user/'+$scope.loginNew.username).
				then(function (res){
					$scope.login_new_id = res.data
					if(res.data) {$scope.login_new_en = true}
					else {$scope.login_new_en = false}
				})
		}

		$scope.loginNewCheck_pw = function(){
			if ($scope.loginNew.password != $scope.loginNew.password_c){ $scope.login_new_pw = true }
			else { $scope.login_new_pw = false }
		}

		$scope.loginNew_submit = function(){
			$http.post(root+'/api/user/',{
				username:$scope.loginNew.username,
				password:$scope.loginNew.password,
				gender:$scope.loginNew.gender=='F'?0:1,
				insta:$scope.loginNew.instaID?$scope.loginNew.instaID:null}).
				then(function (res){
					console.log(res.data)
					UserSvc.login($scope.loginNew.username, $scope.loginNew.password).
						then(function (res2){
							$scope.$emit('login', res2.data)
							UserAuth.setCurrentUser(res2.data.username)
							//UserAuth.setToken(res2.data)
							$scope.loginNew.username = ''
							$scope.loginNew.password = ''
							$scope.loginNew.password_c = ''
							$scope.loginNew.gender = ''
							$scope.loginNew.instaID = ''
							$scope.login_new = false
							$scope.login_login = true
							$scope.profile_show()
						})
				})
		}

		$scope.loginNew_back = function(){
			$scope.login_login = false
			$scope.login_new = false
		}

		$scope.doLogin = function() {
			UserSvc.login($scope.loginData.username, $scope.loginData.password).
				then(function (res){
					if(res){
						//$scope.$emit('login', res.data)
						//UserAuth.setToken(res.data)
						UserAuth.setCurrentUser(res.data.username)
						$scope.login_login = true
						$scope.login_wrong = false
						$scope.profile_show()
					}else{
						$scope.login_wrong = true
					}
				})
		};

		$scope.profile_show = function(){
			$scope.login_profile = true
			if(UserAuth.isSessionActive()){
				$scope.profile_username = UserAuth.getCurrentUser()
				$http.get(root+'/api/user/'+$scope.profile_username).
					then(function (res){
						if(res.data) {
							$scope.profile_gender = res.data.gender==0? "Female":"Male"
							if(res.data.insta != null){
								$scope.profile_insta = res.data.insta
							}else{
								$scope.profile_insta = "We Need Your Instagram Bro"
							}
						} else {$scope.profile_logout();}
					})
			}else{$scope.profile_logout();}
		}

		$scope.profile_logout = function(){
			$scope.login_profile = false
			$scope.login_login = false
			$scope.loginData.username = ''
			$scope.loginData.password = ''
			UserAuth.removeToken()
			UserAuth.removeCurrentUser()
		}

		if(UserAuth.isSessionActive()){
			$scope.login_login = true
			$scope.profile_show()
		}
	})

	.controller('InquiryCtrl', function($scope, $http, $timeout, UserAuth){
		$scope.root = root;
		$scope.comment_sended = false
		$scope.sendInquiry = function(){
			$http.post(root+'/api/inquiry/',{
				comment:$scope.comment,
				user:UserAuth.isSessionActive()?UserAuth.getCurrentUser():null}).
				then(function (res){
					console.log(res.data)
					$scope.comment = ''
					$scope.comment_sended = true
					$timeout(function(){ $scope.comment_sended = false }, 1000);
				})
		}
	})


	.controller('SnapBoxCtrl', function($scope, $http, $ionicModal, $rootScope, $ionicHistory, $ionicPopup, $state, UserAuth){

		$scope.root= root;
		$scope.images = [];
		$scope.pages=0;
		$scope.total=0;
		$scope.getCurrentUser= UserAuth.getCurrentUser;
		$scope.isSessionActive = UserAuth.isSessionActive;

		$scope.resetImg = function(){

			$http.get(root+'/api/user/'+$scope.user).success(function(info){
				$scope.images = [];
				$scope.pages=0;
				$scope.total=0;

				//console.log($scope.user)
				$scope.userInfo= info;
				$scope.likedImages = $scope.userInfo.photo_like;
				$scope.total = $scope.likedImages.length;

				$scope.getMoreImages();

				//console.log($scope.images, "liked image urls loaded completed");
				//console.log($scope.images[1]+$scope.images[3]);
				//$scope.$apply();

			}).error(function(err){

				console.log(err);

			});
		}

		$scope.getMoreImages = function(){

			$scope.loadingUnit = $scope.pages ? 8 : 20 ;


			for( i =0 ; i < $scope.loadingUnit ; i++){
				if($scope.total > $scope.loadingUnit * $scope.pages + i) {

					$scope.images.push($scope.likedImages[$scope.loadingUnit * $scope.pages + i])
				};
				console.log("loaded images # is "+ $scope.images.length)
			}

			$scope.pages++;

			console.log("getMoreImages!"+"pages: "+$scope.pages)
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// showImages- scroll
		$scope.showImages = function(index) {
			$scope.activeSlide = index;
			$scope.showModal('templates/imageModal.html');
		}

		/*
		$scope.zoomMin = 1;
		$scope.showImages = function(index) {
		  $scope.activeSlide = index;
		  $scope.showModal('templates/imageModal_zoom.html');
		};*/

		$scope.removeImages = function(img_path, index, islast){
			console.log("next img "+index);
			$http.put(root+'/api/user/'+UserAuth.getCurrentUser()+'/like_remove/'+img_path)
				.success(function(res){$scope.resetImg(); if(!islast) {$scope.showImages(index);}})
				.error(function(err){ console.log(err); });
		}

		$scope.showModal = function(templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				//animation: 'slide-in-up' for slide
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}

		// Close the modal
		$scope.closeModal = function() {
			$scope.modal.hide();
			$scope.modal.remove()
		};

		$scope.updateSlideStatus = function(slide) {
			var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
			if (zoomFactor == $scope.zoomMin) {
				$ionicSlideBoxDelegate.enableSlide(true);
			} else {
				$ionicSlideBoxDelegate.enableSlide(false);
			}
		};


		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
			//event.preventDefault();
			// transitionTo() promise will be rejected with
			// a 'transition prevented' error
			if(toState.name == "app.snapbox"){
				$scope.initialize()
			}
		})

		$scope.initialize = function(){
			if(!UserAuth.isSessionActive()){
				$ionicPopup.show({
					template: '<div>',
					title: '로그인이 필요합니다',
					subTitle: 'Please login to use gallery',
					scope: $scope,
					buttons: [
						{text: '<b>로그인하러 가기</b>', type: 'button-positive', onTap: function(e) {
							$ionicHistory.nextViewOptions({disableBack: true});
							$state.go('app.profile');
						}}
					]
				});
			}else{
				$scope.user =  $scope.getCurrentUser();
				$scope.resetImg();
			}
		}

		$scope.initialize()

	});