from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import IsAuthenticated
from . import models, serializers

class Register(APIView):
    def post(self, request):
        data = request.data
        print(data)
        serializer = serializers.RegisterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'Success'}, status=201)
        else:
            return Response(serializer.errors, status=400)

class Login(APIView):
    def post(self, request):
        data = request.data
        serializer = serializers.LoginSerializer(data=data)
        try:
            if serializer.is_valid():
                user = serializer.validated_data
                refresh = RefreshToken.for_user(user)
                return Response({'refreshToken': str(refresh), 'accessToken': str(refresh.access_token), 'email': data.get('email')}, status=200)
            else:
                return Response(serializer.errors, status = 401)
        except models.User.DoesNotExist:
            return Response({'User Does Not Exist'}, status= 404)
        
class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        refresh = request.data.get('refreshToken')
        token = RefreshToken(refresh)
        token.blacklist()
        return Response({'Logged out'}, status=205)

class TokenRefresh(APIView):
    def post(self, request):
        try:
            refreshToken = request.data.get("refreshToken")
            if not refreshToken:
                return Response({'error': 'Refresh token not provided'}, status=400)
            refresh = RefreshToken(refreshToken)
            newAccessToken = str(refresh.access_token)
            return Response({'accessToken': newAccessToken}, status=200)
        except TokenError:
            return Response({'error': TokenError}, status=401)
