"use client";

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Download, Eye, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { strapiAPI } from '@/lib/strapi';

interface Certificate {
  id: string;
  attributes: {
    certificateId: string;
    issuedAt: string;
    certificateStatus: string; // Changed from 'status' to 'certificateStatus'
    user?: {
      data?: {
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    course?: {
      data?: {
        attributes: {
          title: string;
        };
      };
    };
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await strapiAPI.getCertificates({
        page: 1,
        pageSize: 100,
      });
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to load certificates. Please check your Strapi backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = 
      certificate.attributes.user?.data?.attributes.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.attributes.course?.data?.attributes.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.attributes.certificateId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certificates Management</h1>
        <p className="text-muted-foreground">Track and manage course completion certificates</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="font-mono text-sm">
                        {certificate.attributes.certificateId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {certificate.attributes.user?.data?.attributes.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {certificate.attributes.user?.data?.attributes.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {certificate.attributes.user?.data?.attributes.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {certificate.attributes.course?.data?.attributes.title || 'Unknown Course'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={certificate.attributes.certificateStatus === 'issued' ? 'default' : 'secondary'}>
                      {certificate.attributes.certificateStatus || 'issued'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(certificate.attributes.issuedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Certificate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Resend to Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}