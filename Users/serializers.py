from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from . import models

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = "__all__"

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = "__all__"
    
    def validate(self, data):
        if data.get('password') != data.get('verifyPassword'):
            raise serializers.ValidationError({"Password fields didn't match."})
        else:
            data.pop('verifyPassword')
            return data
    
    def create(self, validated_data):
        user = models.User.objects.create_user(
            password= validated_data.get('password'),
            email= validated_data.get('email'),
        )

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email', None)
        password = data.get('password', None)

        if email and password:
            user = models.User.objects.get(email=email)
            if user:
                if user.check_password(password):
                    return user
                else: 
                    raise serializers.ValidationError("Incorrect password")
            else:
                raise serializers.ValidationError("Invalid email")
        else:
            raise serializers.ValidationError("Missing field(s)")