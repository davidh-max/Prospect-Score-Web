'use client';

import React, { useState } from 'react';
import { type TaskDetail } from '@/lib/actions/tasks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  Users,
  Check,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ListTodo,
} from 'lucide-react';

interface TasksTableProps {
  tasks: TaskDetail[];
}

export default function TasksTable({ tasks }: TasksTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (taskId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const getTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'llamada':
      case 'call':
        return <Phone className="w-4 h-4 text-slate-600" />;
      case 'email':
      case 'correo':
        return <Mail className="w-4 h-4 text-slate-600" />;
      case 'reunión':
      case 'reunion':
      case 'meeting':
        return <Users className="w-4 h-4 text-slate-600" />;
      default:
        return <Phone className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    const priorityLower = priority?.toLowerCase() || 'media';
    
    if (priorityLower === 'alta' || priorityLower === 'high') {
      return (
        <Badge className="bg-red-100 text-red-800 border-0 font-medium">
          Alta
        </Badge>
      );
    } else if (priorityLower === 'media' || priorityLower === 'medium') {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-0 font-medium">
          Media
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
          Baja
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getTimeRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Tarea vencida', color: 'text-red-500' };
    } else if (diffDays === 0) {
      return { text: 'Hoy', color: 'text-amber-500' };
    } else if (diffDays === 1) {
      return { text: '1 día', color: 'text-slate-600' };
    } else {
      return { text: `${diffDays} días`, color: 'text-slate-600' };
    }
  };

  const handleComplete = (taskId: string) => {
    // TODO: Implementar lógica de completar tarea
    console.log('Complete task:', taskId);
  };

  const handleEdit = (taskId: string) => {
    // TODO: Implementar lógica de editar tarea
    console.log('Edit task:', taskId);
  };

  const handleDelete = (taskId: string) => {
    // TODO: Implementar lógica de eliminar tarea
    console.log('Delete task:', taskId);
  };

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-slate-200 hover:bg-gray-50">
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Tipo
            </TableHead>
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Prospecto
            </TableHead>
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Tarea
            </TableHead>
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Fecha
            </TableHead>
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Tiempo restante
            </TableHead>
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Prioridad
            </TableHead>
            <TableHead className="h-12 px-4 text-xs uppercase font-bold text-gray-500">
              Detalles
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const isExpanded = expandedRows.has(task.id);
              const timeRemaining = getTimeRemaining(task.due_date);

              return (
                <React.Fragment key={task.id}>
                  <TableRow className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 min-h-[60px]">
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        {getTypeIcon(task.type)}
                        <span className="text-xs text-slate-600">
                          {task.type || 'Llamada'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {task.prospect_initials || 'AH'}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {task.prospect_name || 'Sin prospecto'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">
                        {task.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {formatDate(task.due_date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${timeRemaining.color}`}>
                        {timeRemaining.text}
                      </span>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50"
                          onClick={() => handleComplete(task.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => handleEdit(task.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => toggleRow(task.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={7} className="py-4 px-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-800 mb-2">
                            Descripción completa
                          </h4>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">
                            {task.description || 'No hay descripción disponible para esta tarea.'}
                          </p>
                          {task.prospect_email && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs text-slate-500">
                                <span className="font-medium">Email del prospecto:</span>{' '}
                                {task.prospect_email}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <ListTodo className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No hay tareas pendientes</p>
                  <p className="text-slate-400 text-sm">Crea una nueva tarea para comenzar</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

