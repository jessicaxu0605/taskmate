from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from . import models, serializers

class Register(APIView):
    def post(self, request):
        data = request.data
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
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({'refreshToken': str(refresh), 'accessToken': str(refresh.access_token)}, status=200)
        else:
            return Response(serializer.errors, status = 401)
        
class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        refresh = request.data.get('refreshToken')
        token = RefreshToken(refresh)
        token.blacklist()
        return Response({'Logged out'}, status=205)