import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, Loader2, BookOpen, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type UserRole = 'student' | 'teacher';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signIn, signUp } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'student') {
        navigate('/student', { replace: true });
      } else if (userRole === 'teacher') {
        navigate('/teacher', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, userRole, navigate, location]);

  const validateForm = (isSignUp: boolean) => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(email);
    } catch (e: any) {
      newErrors.email = e.errors[0].message;
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e: any) {
      newErrors.password = e.errors[0].message;
    }
    
    if (isSignUp) {
      try {
        nameSchema.parse(fullName);
      } catch (e: any) {
        newErrors.name = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    
    if (!error) {
      // Navigation will be handled by useEffect
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    const { error } = await signUp(email, password, fullName, selectedRole);
    setIsLoading(false);
    
    if (!error) {
      setActiveTab('login');
      setEmail('');
      setPassword('');
      setFullName('');
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setErrors({});
  };

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">EduTrace</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Select your role to continue
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid gap-4">
            <button
              onClick={() => setSelectedRole('student')}
              className={cn(
                "group flex items-center gap-6 p-6 rounded-2xl border-2 transition-all duration-300",
                "bg-card hover:bg-primary/5 hover:border-primary/50 border-border",
                "text-left"
              )}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">I'm a Student</h3>
                <p className="text-muted-foreground text-sm">
                  Access your learning dashboard, complete concept units, and track your mastery progress
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('teacher')}
              className={cn(
                "group flex items-center gap-6 p-6 rounded-2xl border-2 transition-all duration-300",
                "bg-card hover:bg-secondary/50 hover:border-secondary/50 border-border",
                "text-left"
              )}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">I'm a Teacher</h3>
                <p className="text-muted-foreground text-sm">
                  View class analytics, identify concept gaps, and get insights on student understanding
                </p>
              </div>
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBackToRoleSelection}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Change role
        </Button>

        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center mb-4">
              {selectedRole === 'student' ? (
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              ) : (
                <Users className="w-7 h-7 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {selectedRole === 'student' ? 'Student' : 'Teacher'} Portal
            </CardTitle>
            <CardDescription>
              Sign in to access your {selectedRole === 'student' ? 'learning' : 'class'} dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      `Sign Up as ${selectedRole === 'student' ? 'Student' : 'Teacher'}`
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to EduTrace's Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
