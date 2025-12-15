import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import trendioLogo from '@/assets/trendio-logo.png';
import confetti from 'canvas-confetti';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isLaunched, setIsLaunched] = useState(false);
  const { toast } = useToast();

  const triggerConfetti = useCallback(() => {
    const duration = 5000;
    const end = Date.now() + duration;

    const colors = ['#5B8FB9', '#B6D4E8', '#F5F5F5', '#FFD700'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst in the center
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors
    });
  }, []);

  // Countdown to launch date
  useEffect(() => {
    const launchDate = new Date('2026-01-01T00:00:00');

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance <= 0) {
        setIsLaunched(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        triggerConfetti();
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [triggerConfetti]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Save to database
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already subscribed",
          description: "This email is already on our list.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
      return;
    }

    toast({
      title: "Thank you!",
      description: "You'll be notified when we launch.",
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-santorini-light/20 via-background to-background pointer-events-none" />
      
      <main className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-12">
        {/* Logo */}
        <div className="logo-fade">
          <img 
            src={trendioLogo} 
            alt="Trendio Logo" 
            className="h-16 md:h-20 mx-auto object-contain"
          />
        </div>

        {/* Hero Content */}
        <div className="space-y-6 fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-premium-text leading-tight tracking-tight">
            A New Era of Minimal
            <br />
            <span className="text-santorini-blue">Luxury Fashion</span>
          </h1>
          
          <p className="text-lg md:text-xl text-premium-text-light font-light max-w-2xl mx-auto">
            Our website is launching soon. Be the first to experience it.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="fade-in-delay max-w-2xl mx-auto py-8">
          {isLaunched ? (
            <div className="space-y-4 animate-scale-in">
              <div className="text-4xl md:text-6xl font-display font-semibold text-santorini-blue">
                We're Live!
              </div>
              <p className="text-lg text-premium-text-light">
                Welcome to the new era of luxury fashion
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 md:gap-8">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-3xl md:text-5xl font-display font-semibold text-santorini-blue">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-premium-text-light uppercase tracking-wider font-light">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Subscription */}
        <div className="fade-in-delay-long max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 rounded-full border-border bg-background/50 backdrop-blur-sm text-center sm:text-left px-6 focus-visible:ring-santorini-blue transition-all duration-300"
            />
            <Button 
              type="submit"
              className="h-12 px-8 rounded-full bg-santorini-blue hover:bg-accent text-primary-foreground font-medium transition-all duration-300 hover:scale-105"
            >
              Notify Me
            </Button>
          </form>
        </div>

        {/* Social Icons */}
        <div className="fade-in-delay-long flex items-center justify-center gap-6 pt-8 pb-16 md:pb-8">
          <a 
            href="#" 
            className="text-premium-text-light hover:text-santorini-blue transition-colors duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" strokeWidth={1.5} />
          </a>
          <a 
            href="#" 
            className="text-premium-text-light hover:text-santorini-blue transition-colors duration-300"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" strokeWidth={1.5} />
          </a>
          <a 
            href="#" 
            className="text-premium-text-light hover:text-santorini-blue transition-colors duration-300"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" strokeWidth={1.5} />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="fade-in-delay-long absolute bottom-4 md:bottom-8 left-0 right-0 text-center px-4 space-y-2">
        <p className="text-sm text-premium-text-light font-light">
          For enquiries: <a href="mailto:support@trendio.world" className="text-santorini-blue hover:underline transition-all duration-300">support@trendio.world</a>
        </p>
        <p className="text-sm text-premium-text-light font-light">
          © Trendio - 2025 All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default ComingSoon;
