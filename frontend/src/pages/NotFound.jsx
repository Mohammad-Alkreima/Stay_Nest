import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-xl text-center">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary-600">Page not found</p>
            <h1 className="mt-4 text-4xl font-semibold text-gray-900">We couldn’t find that page.</h1>
          </div>
          <p className="text-gray-600">The link may be broken or the page may have moved. Go back to the homepage to continue exploring.</p>
          <div className="flex justify-center">
            <Link to="/">
              <Button>Go home</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
