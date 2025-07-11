import amqp, { Connection, Channel } from 'amqplib';

export class MessageQueue {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';
      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();
      this.isConnected = true;
      
      console.log('Connected to RabbitMQ');
      
      // Handle connection events
      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });
      
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.isConnected = false;
      });
      
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async ensureQueue(queueName: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }
    
    await this.channel.assertQueue(queueName, {
      durable: true
    });
  }

  async publish(queueName: string, message: any): Promise<boolean> {
    try {
      await this.ensureQueue(queueName);
      
      if (!this.channel) {
        throw new Error('Channel not initialized');
      }
      
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const sent = this.channel.sendToQueue(queueName, messageBuffer, {
        persistent: true
      });
      
      console.log(`Message published to ${queueName}:`, message);
      return sent;
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async consume(queueName: string, callback: (content: any, ack: () => void) => void): Promise<void> {
    try {
      await this.ensureQueue(queueName);
      
      if (!this.channel) {
        throw new Error('Channel not initialized');
      }
      
      this.channel.consume(queueName, (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`Message received from ${queueName}:`, content);
            
            callback(content, () => {
              if (this.channel) {
                this.channel.ack(msg);
              }
            });
          } catch (error) {
            console.error('Error processing message:', error);
            if (this.channel) {
              this.channel.nack(msg, false, false);
            }
          }
        }
      });
      
      console.log(`Listening for messages on ${queueName}`);
    } catch (error) {
      console.error('Failed to consume messages:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.isConnected = false;
    }
  }
}
