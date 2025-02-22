import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Form, 
    Input, 
    Button, 
    Select, 
    message, 
    Alert, 
    Card, 
    Space, 
    Typography, 
    Modal, 
    Steps,
    Divider,
    Row,
    Col,
    Spin,
    Tag,
    Tooltip,
    Badge,
    Checkbox,
    Upload
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    TagOutlined,
    UploadOutlined
} from '@ant-design/icons';
import SolutionTypeService from '../../api/SolutionTypeService';
import { createTicketSolution, uploadSolutionAttachments } from '../../api/TicketSolutionService';
import { getTicketById } from '../../api/TicketService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const statusColors = {
    'New': '#1890ff',
    'In Progress': '#faad14',
    'Completed': '#52c41a',
    'Cancelled': '#ff4d4f'
};

const CreateTicketSolutionPage = () => {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ticket, setTicket] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!id || isNaN(parseInt(id))) {
            message.error('Geçersiz çağrı ID');
            navigate('/tickets');
            return;
        }
        fetchTicketDetails();
        fetchSolutionTypes();
    }, [id, navigate]);

    const fetchTicketDetails = async () => {
        try {
            const response = await getTicketById(id);
            console.log('Full ticket response:', response);
            const ticketData = Array.isArray(response.data) ? response.data[0] : response.data;
            console.log('Processed ticket data:', ticketData);
            setTicket(ticketData);
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            message.error('Çağrı detayları yüklenirken bir hata oluştu.');
        }
    };

    const fetchSolutionTypes = async () => {
        try {
            const response = await SolutionTypeService.getSolutionTypes();
            setSolutionTypes(response.data);
        } catch (error) {
            message.error('Çözüm türleri yüklenirken bir hata oluştu.');
        }
    };

    const showConfirm = (values) => {
        confirm({
            title: 'Çağrıyı kapatmak istediğinizden emin misiniz?',
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            content: (
                <div>
                    <Paragraph>Bu işlem geri alınamaz.</Paragraph>
                    {values.isChronicle && (
                        <Paragraph style={{ color: '#1890ff' }}>
                            <InfoCircleOutlined style={{ marginRight: 8 }} />
                            Çağrıyı kronik olarak işaretlediniz.
                        </Paragraph>
                    )}
                    <Divider />
                    <Text strong>Çözüm Detayları:</Text>
                    <Paragraph style={{ marginTop: 8 }}>
                        <Text type="secondary">Başlık:</Text> {values.subject}
                    </Paragraph>
                    <Paragraph>
                        <Text type="secondary">Çözüm Türü:</Text> {' '}
                        {solutionTypes.find(t => t.id === values.solutionTypeId)?.name}
                    </Paragraph>
                </div>
            ),
            okText: 'Evet, Kapat',
            okButtonProps: {
                icon: <CheckCircleOutlined />,
                type: 'primary',
                danger: true
            },
            cancelText: 'İptal',
            cancelButtonProps: {
                icon: <CloseCircleOutlined />
            },
            onOk() {
                handleSubmit(values);
            },
            width: 500,
            centered: true,
            maskClosable: false
        });
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');
        try {
            const parsedTicketId = parseInt(id);
            if (isNaN(parsedTicketId)) {
                throw new Error('Geçersiz çağrı ID');
            }

            const solutionData = {
                ...values,
                ticketId: parsedTicketId,
                solutionTypeId: parseInt(values.solutionTypeId),
                isChronicle: values.isChronicle || false
            };
            
            const response = await createTicketSolution(solutionData);
            const newSolutionId = response.data.id;

            // Upload attachments if any
            if (values.attachments && values.attachments.length > 0) {
                const files = values.attachments.map(file => file.originFileObj);
                await uploadSolutionAttachments(newSolutionId, files);
            }

            setCurrentStep(2);
            message.success({
                content: 'Çağrı başarıyla kapatıldı.',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
            });
            
            setTimeout(() => {
                if (location.state?.isClosing) {
                    navigate('/tickets');
                } else {
                    navigate(`/tickets/${id}/solutions`);
                }
            }, 2000);
        } catch (error) {
            setCurrentStep(1);
            const errorMessage = error.response?.data || error.message || 'Çağrı kapatılırken bir hata oluştu.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Çözüm Girişi',
            description: 'Çözüm bilgilerini girin',
            icon: <InfoCircleOutlined />
        },
        {
            title: 'Onay',
            description: 'Bilgileri kontrol edin',
            icon: <SaveOutlined />
        },
        {
            title: 'Tamamlandı',
            description: 'Çağrı kapatıldı',
            icon: <CheckCircleOutlined />
        }
    ];

    if (!id || isNaN(parseInt(id))) {
        return null;
    }

    if (!ticket) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <Card 
                bordered={false} 
                className="shadow-sm"
                style={{
                    borderRadius: 8,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                            <Button 
                                icon={<ArrowLeftOutlined />} 
                                onClick={() => navigate(-1)}
                                style={{ borderRadius: 6 }}
                            >
                                Geri
                            </Button>
                            <Title 
                                level={4} 
                                style={{ 
                                    margin: 0,
                                    background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent'
                                }}
                            >
                                Çağrıyı Kapat
                            </Title>
                        </Space>
                        <Space>
                            <Badge 
                                status={ticket.status === 'New' ? 'processing' : 'default'} 
                                text={ticket.status}
                            />
                            <Divider type="vertical" />
                            <Text type="secondary">#{ticket.registrationNumber}</Text>
                        </Space>
                    </div>

                    <Steps 
                        current={currentStep} 
                        items={steps}
                        style={{ padding: '20px 0' }}
                    />

                    {error && (
                        <Alert
                            message="Hata"
                            description={error}
                            type="error"
                            showIcon
                            icon={<CloseCircleOutlined />}
                            style={{ 
                                marginBottom: 16,
                                borderRadius: 8
                            }}
                        />
                    )}

                    <Card 
                        title={
                            <Space>
                                <FileTextOutlined />
                                <span>Çağrı Detayları</span>
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 8 }}
                    >
                        <Row gutter={[24, 24]}>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <Text type="secondary">
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        Talep Eden
                                    </Text>
                                    <Space direction="vertical" size={0}>
                                        <Text>{ticket?.user?.name || '-'} {ticket?.user?.surname || ''}</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {ticket?.user?.email || '-'}
                                        </Text>
                                        <Space size={4}>
                                            <Tag color="blue">{ticket?.user?.department?.name || '-'}</Tag>
                                            <Tag color="purple">{ticket?.group?.name || '-'}</Tag>
                                        </Space>
                                    </Space>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <Text type="secondary">
                                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                                        Oluşturulma Tarihi
                                    </Text>
                                    <Text>{new Date(ticket.createdDate).toLocaleString()}</Text>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <Text type="secondary">
                                        <TagOutlined style={{ marginRight: 8 }} />
                                        Departman
                                    </Text>
                                    <Text>{ticket?.user?.department?.name || '-'}</Text>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <Text type="secondary">
                                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                                        Konum
                                    </Text>
                                    <Text>{ticket.location || '-'}</Text>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text type="secondary">Konu</Text>
                                    <Text strong>{ticket.subject || '-'}</Text>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text type="secondary">Açıklama</Text>
                                    <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ticket.description || '-'}</Paragraph>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                    
                    <Card 
                        title={
                            <Space>
                                <CheckCircleOutlined />
                                <span>Çözüm Bilgileri</span>
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 8 }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={showConfirm}
                            requiredMark="optional"
                        >
                            <Form.Item
                                name="solutionTypeId"
                                label="Çözüm Türü"
                                rules={[{ required: true, message: 'Lütfen çözüm türü seçiniz' }]}
                            >
                                <Select 
                                    placeholder="Çözüm türü seçiniz"
                                    style={{ borderRadius: 6 }}
                                    optionLabelProp="label"
                                >
                                    {solutionTypes.map(type => (
                                        <Select.Option 
                                            key={type.id} 
                                            value={type.id}
                                            label={type.name}
                                        >
                                            <Space>
                                                <TagOutlined />
                                                {type.name}
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="subject"
                                label="Çözüm Başlığı"
                                rules={[{ required: true, message: 'Lütfen çözüm başlığı giriniz' }]}
                            >
                                <Input 
                                    placeholder="Örn: Sorun giderildi" 
                                    style={{ borderRadius: 6 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Çözüm Açıklaması"
                                rules={[{ required: true, message: 'Lütfen çözüm açıklaması giriniz' }]}
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Çözüm detaylarını buraya giriniz..."
                                    style={{ 
                                        borderRadius: 6,
                                        resize: 'vertical',
                                        minHeight: 120
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="isChronicle"
                                valuePropName="checked"
                            >
                                <Checkbox>
                                    Kronik Çözüm
                                </Checkbox>
                            </Form.Item>

                            <Form.Item
                                name="attachments"
                                label="Dosya Ekleri"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e?.fileList;
                                }}
                            >
                                <Upload
                                    multiple
                                    beforeUpload={() => false}
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                >
                                    <Button icon={<UploadOutlined />}>Dosya Seç</Button>
                                    <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                                        Birden fazla dosya seçebilirsiniz
                                    </Typography.Text>
                                </Upload>
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                                <Space size="middle">
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={loading}
                                        icon={<CheckCircleOutlined />}
                                        style={{
                                            borderRadius: 6,
                                            background: 'linear-gradient(45deg, #52c41a, #73d13d)',
                                            border: 'none',
                                            boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                                        }}
                                    >
                                        Çağrıyı Kapat
                                    </Button>
                                    <Button 
                                        onClick={() => navigate(-1)}
                                        icon={<CloseCircleOutlined />}
                                        style={{ borderRadius: 6 }}
                                    >
                                        İptal
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Space>
            </Card>
        </div>
    );
};

export default CreateTicketSolutionPage;
