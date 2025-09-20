import { message, Modal } from 'ant-design-vue';

// 将全局声明移到文件顶部
declare global {
  interface Window {
    ant?: {
      message: {
        success: (message: string, duration?: number) => void;
        warning: (message: string, duration?: number) => void;
        info: (message: string, duration?: number) => void;
        error: (message: string, duration?: number) => void;
      };
    };
  }
}

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  DOWNLOAD_ERROR = 'DOWNLOAD_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 自定义错误类
 */
export class FileManagerError extends Error {
  public type: ErrorType;
  public originalError?: Error;
  public details?: any;

  constructor(type: ErrorType, message: string, originalError?: Error, details?: any) {
    super(message);
    this.name = 'FileManagerError';
    this.type = type;
    this.originalError = originalError;
    this.details = details;
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理和显示错误
   */
  static handleError(error: Error | FileManagerError, context?: string): void {
    console.error('文件管理错误:', error);

    let errorMessage = '';
    let errorType = ErrorType.UNKNOWN_ERROR;

    if (error instanceof FileManagerError) {
      errorType = error.type;
      errorMessage = error.message;
    } else {
      // 根据错误信息判断错误类型
      errorType = this.categorizeError(error);
      errorMessage = this.getErrorMessage(errorType, error.message);
    }

    // 显示错误消息
    this.showErrorMessage(errorType, errorMessage, context);

    // 记录错误日志
    this.logError(error, context);
  }

  /**
   * 根据错误信息分类错误类型
   */
  private static categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('连接')) {
      return ErrorType.NETWORK_ERROR;
    }
    
    if (message.includes('auth') || message.includes('认证') || message.includes('401')) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    
    if (message.includes('permission') || message.includes('权限') || message.includes('403')) {
      return ErrorType.PERMISSION_ERROR;
    }
    
    if (message.includes('not found') || message.includes('404') || message.includes('不存在')) {
      return ErrorType.FILE_NOT_FOUND;
    }
    
    if (message.includes('too large') || message.includes('文件过大')) {
      return ErrorType.FILE_TOO_LARGE;
    }
    
    if (message.includes('upload') || message.includes('上传')) {
      return ErrorType.UPLOAD_ERROR;
    }
    
    if (message.includes('download') || message.includes('下载')) {
      return ErrorType.DOWNLOAD_ERROR;
    }
    
    if (message.includes('delete') || message.includes('删除')) {
      return ErrorType.DELETE_ERROR;
    }

    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * 获取用户友好的错误消息
   */
  private static getErrorMessage(errorType: ErrorType, originalMessage: string): string {
    const errorMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络设置或稍后重试',
      [ErrorType.AUTHENTICATION_ERROR]: '身份认证失败，请检查访问凭证',
      [ErrorType.PERMISSION_ERROR]: '权限不足，无法执行此操作',
      [ErrorType.FILE_NOT_FOUND]: '文件或文件夹不存在',
      [ErrorType.FILE_TOO_LARGE]: '文件过大，请选择较小的文件',
      [ErrorType.UPLOAD_ERROR]: '文件上传失败，请重试',
      [ErrorType.DOWNLOAD_ERROR]: '文件下载失败，请重试',
      [ErrorType.DELETE_ERROR]: '删除操作失败，请重试',
      [ErrorType.UNKNOWN_ERROR]: '操作失败，请重试或联系管理员'
    };

    return errorMessages[errorType] || originalMessage;
  }

  /**
   * 显示错误消息
   */
  private static showErrorMessage(errorType: ErrorType, errorMessage: string, context?: string): void {
    const contextPrefix = context ? `[${context}] ` : '';
    
    switch (errorType) {
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.PERMISSION_ERROR:
        Modal.error({
          title: '访问错误',
          content: contextPrefix + errorMessage,
          okText: '确定'
        });
        break;
        
      case ErrorType.FILE_TOO_LARGE:
        Modal.warning({
          title: '文件警告',
          content: contextPrefix + errorMessage,
          okText: '确定'
        });
        break;
        
      case ErrorType.NETWORK_ERROR:
        message.error(contextPrefix + errorMessage, 5);
        break;
        
      default:
        message.error(contextPrefix + errorMessage, 3);
        break;
    }
  }

  /**
   * 记录错误日志
   */
  private static logError(error: Error, context?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 发送到日志服务（这里可以扩展为发送到后端日志系统）
    console.error('文件管理错误日志:', logData);
    
    // 可以在这里添加发送到后端的逻辑
    // this.sendErrorToBackend(logData);
  }

  /**
   * 创建特定类型的错误
   */
  static createError(type: ErrorType, message: string, originalError?: Error, details?: any): FileManagerError {
    return new FileManagerError(type, message, originalError, details);
  }

  /**
   * 发送错误到后端（可选实现）
   */
  private static async sendErrorToBackend(logData: any): Promise<void> {
    try {
      // 这里可以添加发送到后端日志系统的逻辑
      // await fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // });
    } catch (error) {
      console.error('发送错误日志到后端失败:', error);
    }
  }
}

/**
 * 加载状态管理器
 */
export class LoadingManager {
  private static loadingStates = new Map<string, boolean>();
  private static loadingCallbacks = new Map<string, Set<(loading: boolean) => void>>();

  /**
   * 设置加载状态
   */
  static setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
    
    const callbacks = this.loadingCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(loading));
    }
  }

  /**
   * 获取加载状态
   */
  static getLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  /**
   * 订阅加载状态变化
   */
  static subscribe(key: string, callback: (loading: boolean) => void): () => void {
    if (!this.loadingCallbacks.has(key)) {
      this.loadingCallbacks.set(key, new Set());
    }
    
    this.loadingCallbacks.get(key)!.add(callback);
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.loadingCallbacks.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * 清除所有加载状态
   */
  static clearAll(): void {
    this.loadingStates.clear();
    this.loadingCallbacks.clear();
  }
}

/**
 * 操作反馈工具
 */
export class FeedbackManager {
  /**
   * 显示成功消息
   */
  static success(message: string, duration: number = 3): void {
    message && window.ant?.message.success(message, duration);
  }

  /**
   * 显示警告消息
   */
  static warning(message: string, duration: number = 3): void {
    message && window.ant?.message.warning(message, duration);
  }

  /**
   * 显示信息消息
   */
  static info(message: string, duration: number = 3): void {
    message && window.ant?.message.info(message, duration);
  }

  /**
   * 显示确认对话框
   */
  static confirm(
    title: string,
    content: string,
    onOk: () => void | Promise<void>,
    onCancel?: () => void
  ): void {
    Modal.confirm({
      title,
      content,
      onOk,
      onCancel
    });
  }

  /**
   * 显示操作进度
   */
  static showProgress(
    title: string,
    progress: number,
    onCancel?: () => void
  ): { close: () => void; update: (progress: number) => void } {
    let modalInstance: any = null;
    
    const update = (newProgress: number) => {
      if (modalInstance) {
        // 更新进度（这里需要根据实际的进度组件实现）
      }
    };

    const close = () => {
      if (modalInstance) {
        modalInstance.destroy();
        modalInstance = null;
      }
    };

    modalInstance = Modal.info({
      title,
      content: '操作进行中...',
      okText: onCancel ? '取消' : '确定',
      onOk: onCancel || close
    });

    return { close, update };
  }
}

// 导出错误处理的便捷函数
export const handleError = ErrorHandler.handleError;
export const createError = ErrorHandler.createError;
export const feedback = FeedbackManager;
export const loading = LoadingManager;