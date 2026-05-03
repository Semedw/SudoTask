from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .serializers import RegisterSerializer, UserSerializer, UserProfileSerializer

User = get_user_model()


class AuthCookieConfigurationError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Authentication is temporarily unavailable due to server configuration.'
    default_code = 'auth_cookie_misconfigured'


def _normalized_cookie_samesite() -> str:
    raw = str(getattr(settings, 'AUTH_COOKIE_SAMESITE', '') or '').strip().lower()
    mapping = {
        'lax': 'Lax',
        'strict': 'Strict',
        'none': 'None',
    }
    if raw not in mapping:
        raise ImproperlyConfigured('AUTH_COOKIE_SAMESITE must be one of: Lax, Strict, None.')
    if raw == 'none' and not settings.AUTH_COOKIE_SECURE:
        raise ImproperlyConfigured('AUTH_COOKIE_SECURE must be True when AUTH_COOKIE_SAMESITE is None.')
    return mapping[raw]


def _validated_cookie_domain() -> str | None:
    value = getattr(settings, 'AUTH_COOKIE_DOMAIN', None)
    if value is None:
        return None
    domain = str(value).strip()
    if not domain:
        return None
    if '://' in domain or '/' in domain or ':' in domain or any(ch.isspace() for ch in domain):
        raise ImproperlyConfigured(
            'AUTH_COOKIE_DOMAIN must be a plain host/domain without scheme, path, port, or spaces.'
        )
    return domain


def _cookie_options() -> dict:
    return {
        'httponly': True,
        'secure': settings.AUTH_COOKIE_SECURE,
        'samesite': _normalized_cookie_samesite(),
        'domain': _validated_cookie_domain(),
        'path': '/',
    }


def _set_auth_cookies(response: Response, refresh: RefreshToken):
    access = refresh.access_token
    response.set_cookie(
        settings.AUTH_ACCESS_COOKIE_NAME,
        str(access),
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        **_cookie_options(),
    )
    response.set_cookie(
        settings.AUTH_REFRESH_COOKIE_NAME,
        str(refresh),
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        **_cookie_options(),
    )


def _clear_auth_cookies(response: Response):
    response.delete_cookie(
        settings.AUTH_ACCESS_COOKIE_NAME,
        domain=settings.AUTH_COOKIE_DOMAIN,
        path='/',
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        settings.AUTH_REFRESH_COOKIE_NAME,
        domain=settings.AUTH_COOKIE_DOMAIN,
        path='/',
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""

    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response = Response(
            {'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
        try:
            _set_auth_cookies(response, refresh)
        except ImproperlyConfigured as exc:
            raise AuthCookieConfigurationError() from exc
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, email=email, password=password)
        if user is None:
            user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        response = Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
        try:
            _set_auth_cookies(response, refresh)
        except ImproperlyConfigured as exc:
            raise AuthCookieConfigurationError() from exc
        return response


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response({'detail': 'No refresh token cookie found.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
        except TokenError:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({'detail': 'Token refreshed.'}, status=status.HTTP_200_OK)
        try:
            response.set_cookie(
                settings.AUTH_ACCESS_COOKIE_NAME,
                str(access),
                max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                **_cookie_options(),
            )
        except ImproperlyConfigured as exc:
            raise AuthCookieConfigurationError() from exc
        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)
        try:
            _clear_auth_cookies(response)
        except ImproperlyConfigured as exc:
            raise AuthCookieConfigurationError() from exc
        return response


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    return Response({'detail': 'CSRF cookie set.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Get current user profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_view(request):
    """Update current user profile."""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
