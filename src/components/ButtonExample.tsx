import React from 'react';
import { Save, Download, Trash2, Plus, Upload } from 'lucide-react';
import Button from './Button';

const ButtonExample: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Button Component Examples</h1>
        
        {/* Variants */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </section>

        {/* Sizes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </section>

        {/* With Icons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">With Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button icon={<Save />}>Save Document</Button>
            <Button icon={<Download />} variant="secondary">Download</Button>
            <Button icon={<Plus />} iconPosition="left" variant="outline">Add Item</Button>
            <Button icon={<Trash2 />} iconPosition="right" variant="danger">Delete</Button>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Loading States</h2>
          <div className="flex flex-wrap gap-4">
            <Button loading>Loading...</Button>
            <Button loading variant="secondary">Processing</Button>
            <Button loading variant="outline">Uploading</Button>
          </div>
        </section>

        {/* Disabled States */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Disabled States</h2>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled Primary</Button>
            <Button disabled variant="secondary">Disabled Secondary</Button>
            <Button disabled variant="outline">Disabled Outline</Button>
          </div>
        </section>

        {/* Full Width */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Full Width</h2>
          <div className="space-y-4">
            <Button fullWidth>Full Width Primary</Button>
            <Button fullWidth variant="outline" icon={<Download />}>
              Full Width with Icon
            </Button>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Interactive Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Form Actions</h3>
              <div className="space-y-3">
                <Button fullWidth>Submit Form</Button>
                <Button fullWidth variant="outline">Cancel</Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">File Operations</h3>
              <div className="space-y-3">
                <Button fullWidth icon={<Upload />} variant="secondary">
                  Upload File
                </Button>
                <Button fullWidth icon={<Download />} variant="outline">
                  Download Report
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonExample;
